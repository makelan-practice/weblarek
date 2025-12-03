import "./scss/styles.scss";
import { Catalog } from "./models/Catalog";
import { Cart } from "./models/Cart";
import { Buyer } from "./models/Buyer";
import { Api } from "./components/base/Api";
import { ShopAPI } from "./api/ShopAPI";
import { API_URL, CDN_URL } from "./utils/constants";
import { ensureElement, cloneTemplate } from "./utils/utils";
import { Header } from "./components/Header";
import { Basket } from "./components/Basket";
import { Modal } from "./components/Modal";
import { Order } from "./components/Order";
import { Contacts } from "./components/Contacts";
import { Success } from "./components/Success";
import { CardCatalog } from "./components/card/CardCatalog";
import { CardPreview } from "./components/card/CardPreview";
import { CardBasket } from "./components/card/CardBasket";
import { EventEmitter } from "./components/base/Events";
import { IOrderRequest } from "./types";

// Инициализация моделей данных
const catalogModel = new Catalog();
const cartModel = new Cart();
const buyerModel = new Buyer();
const events = new EventEmitter();

// Инициализация API
const api = new Api(API_URL);
const shopApi = new ShopAPI(api);

// Инициализация компонентов представления
const headerContainer = ensureElement<HTMLElement>(".header");
const galleryContainer = ensureElement<HTMLElement>(".gallery");
const modalContainer = ensureElement<HTMLElement>("#modal-container");

const header = new Header(events, headerContainer);
const modal = new Modal(events, modalContainer);

// Шаблоны для создания компонентов
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>("#card-catalog");
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>("#card-preview");
const cardBasketTemplate = ensureElement<HTMLTemplateElement>("#card-basket");
const basketTemplate = ensureElement<HTMLTemplateElement>("#basket");
const orderTemplate = ensureElement<HTMLTemplateElement>("#order");
const contactsTemplate = ensureElement<HTMLTemplateElement>("#contacts");
const successTemplate = ensureElement<HTMLTemplateElement>("#success");

// ============ Вспомогательные функции ============

/**
 * Валидация формы заказа (проверяет только payment и address)
 */
function validateOrderForm(buyer: Buyer): {
  errors: Partial<Record<keyof import("./types").IBuyer, string>>;
  isValid: boolean;
} {
  const errors: Partial<Record<keyof import("./types").IBuyer, string>> = {};
  const data = buyer.getData();

  if (!data.payment || data.payment === null) {
    errors.payment = "Не выбран способ оплаты";
  }

  if (!data.address || data.address.trim() === "") {
    errors.address = "Укажите адрес доставки";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}

// ============ Обработчики событий от моделей данных ============

// Обработка изменения каталога товаров
catalogModel.on("items:changed", (data: { items: any[] }) => {
  const items = data.items;
  const cards: HTMLElement[] = [];

  items.forEach((item) => {
    const cardElement = cloneTemplate<HTMLElement>(cardCatalogTemplate);
    const card = new CardCatalog(cardElement, {
      onClick: () => {
        events.emit("card:select", { id: item.id });
      },
    });

    card.render({
      title: item.title,
      image: `${CDN_URL}/${item.image}`,
      category: item.category,
      price: item.price,
    });

    cards.push(cardElement);
  });

  galleryContainer.innerHTML = "";
  cards.forEach((card) => galleryContainer.appendChild(card));
});

// Обработка изменения выбранного товара для просмотра
catalogModel.on("preview:changed", (data: { preview: any }) => {
  const preview = data.preview;
  if (!preview) return;

  const previewElement = cloneTemplate<HTMLElement>(cardPreviewTemplate);
  const isInCart = cartModel.contains(preview.id);

  const card = new CardPreview(previewElement, {
    onClick: () => {
      if (isInCart) {
        events.emit("card:remove", { id: preview.id });
      } else {
        events.emit("card:add", { id: preview.id });
      }
    },
  });

  card.render({
    title: preview.title,
    image: `${CDN_URL}/${preview.image}`,
    category: preview.category,
    price: preview.price,
    description: preview.description,
  });

  // Если цена отсутствует, блокируем кнопку и устанавливаем текст "Недоступно"
  if (preview.price === null) {
    card.buttonText = "Недоступно";
    card.buttonDisabled = true;
  } else {
    card.isInCart = isInCart;
  }

  modal.render({ content: previewElement });
  modal.open();
});

// Обработка изменения содержимого корзины
cartModel.on("items:changed", (data: { items: any[] }) => {
  const items = data.items;
  const total = cartModel.getTotal();
  const count = cartModel.getCount();

  // Обновление счетчика в хедере
  header.render({ counter: count });

  // Обновление корзины (если она открыта)
  const basketElement = modalContainer.querySelector(".basket");
  if (basketElement) {
    const basket = new Basket(events, basketElement as HTMLElement);
    const cardElements: HTMLElement[] = [];

    items.forEach((item, index) => {
      const cardElement = cloneTemplate<HTMLElement>(cardBasketTemplate);
      const card = new CardBasket(cardElement, {
        onClick: () => {
          events.emit("card:remove", { id: item.id });
        },
      });

      card.render({
        title: item.title,
        price: item.price,
      });
      card.index = index + 1;

      cardElements.push(cardElement);
    });

    basket.render({
      items: cardElements,
      total: total,
    });
  }
});

// Обработка изменения данных покупателя
buyerModel.on("data:changed", (eventData: { data: any }) => {
  const data = eventData.data;
  const allErrors = buyerModel.validate();

  // Обновление формы заказа (если она открыта)
  const orderElement = modalContainer.querySelector(".form[name='order']");
  if (orderElement) {
    const orderValidation = validateOrderForm(buyerModel);
    const order = new Order(events, orderElement as HTMLElement);
    order.render({
      payment: data.payment,
      address: data.address,
      errors: orderValidation.errors,
    });
    order.valid = orderValidation.isValid;
  }

  // Обновление формы контактов (если она открыта)
  const contactsElement = modalContainer.querySelector(
    ".form[name='contacts']"
  );
  if (contactsElement) {
    const contacts = new Contacts(events, contactsElement as HTMLElement);
    contacts.render({
      email: data.email,
      phone: data.phone,
      errors: { email: allErrors.email, phone: allErrors.phone },
    });
    contacts.valid = !allErrors.email && !allErrors.phone;
  }
});

// ============ Обработчики событий от представлений ============

// Выбор карточки для просмотра
events.on("card:select", (data: { id: string }) => {
  const product = catalogModel.getItemById(data.id);
  if (product) {
    catalogModel.setPreview(product);
  }
});

// Добавление товара в корзину
events.on("card:add", (data: { id: string }) => {
  const product = catalogModel.getItemById(data.id);
  if (product) {
    cartModel.addItem(product);
    // Обновляем preview, если он открыт
    const preview = catalogModel.getPreview();
    if (preview && preview.id === data.id) {
      const previewElement = modalContainer.querySelector(".card_full");
      if (previewElement) {
        const card = new CardPreview(previewElement as HTMLElement, {
          onClick: () => {
            events.emit("card:remove", { id: data.id });
          },
        });
        card.render({
          title: preview.title,
          image: `${CDN_URL}/${preview.image}`,
          category: preview.category,
          price: preview.price,
          description: preview.description,
        });

        // Если цена отсутствует, блокируем кнопку и устанавливаем текст "Недоступно"
        if (preview.price === null) {
          card.buttonText = "Недоступно";
          card.buttonDisabled = true;
        } else {
          card.isInCart = true;
        }
      }
    }
  }
});

// Удаление товара из корзины
events.on("card:remove", (data: { id: string }) => {
  const product = catalogModel.getItemById(data.id);
  if (product) {
    cartModel.removeItem(product);
    // Обновляем preview, если он открыт
    const preview = catalogModel.getPreview();
    if (preview && preview.id === data.id) {
      const previewElement = modalContainer.querySelector(".card_full");
      if (previewElement) {
        const card = new CardPreview(previewElement as HTMLElement, {
          onClick: () => {
            events.emit("card:add", { id: data.id });
          },
        });
        card.render({
          title: preview.title,
          image: `${CDN_URL}/${preview.image}`,
          category: preview.category,
          price: preview.price,
          description: preview.description,
        });

        // Если цена отсутствует, блокируем кнопку и устанавливаем текст "Недоступно"
        if (preview.price === null) {
          card.buttonText = "Недоступно";
          card.buttonDisabled = true;
        } else {
          card.isInCart = false;
        }
      }
    }
  }
});

// Открытие корзины
events.on("basket:open", () => {
  const basketElement = cloneTemplate<HTMLElement>(basketTemplate);
  const basket = new Basket(events, basketElement);
  const items = cartModel.getItems();
  const total = cartModel.getTotal();
  const cardElements: HTMLElement[] = [];

  items.forEach((item, index) => {
    const cardElement = cloneTemplate<HTMLElement>(cardBasketTemplate);
    const card = new CardBasket(cardElement, {
      onClick: () => {
        events.emit("card:remove", { id: item.id });
      },
    });

    card.render({
      title: item.title,
      price: item.price,
      index: index + 1,
    });

    cardElements.push(cardElement);
  });

  basket.render({
    items: cardElements,
    total: total,
  });

  modal.render({ content: basketElement });
  modal.open();
});

// Оформление заказа
events.on("basket:order", () => {
  const orderElement = cloneTemplate<HTMLElement>(orderTemplate);
  const order = new Order(events, orderElement);
  const data = buyerModel.getData();
  const orderValidation = validateOrderForm(buyerModel);

  order.render({
    payment: data.payment as any,
    address: data.address,
    errors: orderValidation.errors,
  });
  order.valid = orderValidation.isValid;

  modal.render({ content: orderElement });
});

// Переход ко второй форме оформления заказа
events.on("order:next", () => {
  const orderValidation = validateOrderForm(buyerModel);

  if (!orderValidation.isValid) {
    // Обновляем форму с ошибками
    const orderElement = modalContainer.querySelector(".form[name='order']");
    if (orderElement) {
      const order = new Order(events, orderElement as HTMLElement);
      const data = buyerModel.getData();
      order.render({
        payment: data.payment,
        address: data.address,
        errors: orderValidation.errors,
      });
      order.valid = false;
    }
    return;
  }

  // Переходим к форме контактов
  const contactsElement = cloneTemplate<HTMLElement>(contactsTemplate);
  const contacts = new Contacts(events, contactsElement);
  const data = buyerModel.getData();
  const allErrors = buyerModel.validate();
  const isValid = Object.keys(allErrors).length === 0;

  contacts.render({
    email: data.email,
    phone: data.phone,
    errors: { email: allErrors.email, phone: allErrors.phone },
    valid: isValid,
  });

  modal.render({ content: contactsElement });
});

// Завершение оформления заказа
events.on("contacts:submit", async () => {
  const errors = buyerModel.validate();
  const emailError = errors.email;
  const phoneError = errors.phone;

  if (emailError || phoneError) {
    // Обновляем форму с ошибками
    const contactsElement = modalContainer.querySelector(
      ".form[name='contacts']"
    );
    if (contactsElement) {
      const contacts = new Contacts(events, contactsElement as HTMLElement);
      const data = buyerModel.getData();
      contacts.render({
        email: data.email,
        phone: data.phone,
        errors: { email: emailError, phone: phoneError },
        valid: false,
      });
    }
    return;
  }

  // Отправляем заказ на сервер
  const buyerData = buyerModel.getData();
  const cartItems = cartModel.getItems();
  const total = cartModel.getTotal();

  const order: IOrderRequest = {
    payment: buyerData.payment,
    email: buyerData.email,
    phone: buyerData.phone,
    address: buyerData.address,
    total: total,
    items: cartItems.map((item) => item.id),
  };

  try {
    const response = await shopApi.createOrder(order);
    console.log("Заказ создан:", response);

    // Показываем окно успеха
    const successElement = cloneTemplate<HTMLElement>(successTemplate);
    const success = new Success(events, successElement);
    success.render({ total: response.total });

    modal.render({ content: successElement });

    // Очищаем корзину и данные покупателя
    cartModel.clear();
    buyerModel.clear();
  } catch (error) {
    console.error("Ошибка при создании заказа:", error);
    alert("Произошла ошибка при оформлении заказа. Попробуйте еще раз.");
  }
});

// Изменение способа оплаты
events.on("order:payment:change", (data: { payment: string }) => {
  buyerModel.setPayment(data.payment as any);
});

// Изменение адреса доставки
events.on("order:address:change", (data: { address: string }) => {
  buyerModel.setAddress(data.address);
});

// Изменение email
events.on("contacts:email:change", (data: { email: string }) => {
  buyerModel.setEmail(data.email);
});

// Изменение телефона
events.on("contacts:phone:change", (data: { phone: string }) => {
  buyerModel.setPhone(data.phone);
});

// Закрытие модального окна
events.on("modal:close", () => {
  catalogModel.setPreview(null);
});

// Закрытие окна успеха
events.on("success:close", () => {
  modal.close();
});

// ============ Загрузка данных с сервера ============

try {
  const data = await shopApi.getProductList();
  catalogModel.setItems(data.items);
} catch (error) {
  console.error("Ошибка при получении каталога:", error);
}
