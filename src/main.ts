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
import { IOrderRequest, IProduct } from "./types";

// ============ Вспомогательные функции ============

/**
 * Создает и рендерит CardPreview с обработчиком клика для добавления/удаления из корзины
 */
function createCardPreview(
  previewElement: HTMLElement,
  preview: IProduct,
  events: EventEmitter,
  cartModel: Cart
): CardPreview {
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
    buttonText: cartModel.getButtonText(preview),
    buttonDisabled: cartModel.isButtonDisabled(preview),
  });

  return card;
}

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

// Создаем элемент корзины один раз из шаблона
const basketElement = cloneTemplate<HTMLElement>(basketTemplate);
const basket = new Basket(events, basketElement);

// Создаем элемент формы заказа один раз из шаблона
const orderElement = cloneTemplate<HTMLElement>(orderTemplate);
const order = new Order(events, orderElement);

// Создаем элемент окна успеха один раз из шаблона
const successElement = cloneTemplate<HTMLElement>(successTemplate);
const success = new Success(events, successElement);

// Создаем элемент формы контактов один раз из шаблона
const contactsElement = cloneTemplate<HTMLElement>(contactsTemplate);
const contacts = new Contacts(events, contactsElement);

// ============ Обработчики событий от моделей данных ============

// Обработка изменения каталога товаров
catalogModel.on("items:changed", () => {
  const items = catalogModel.getItems();

  const cards = items.map((item) => {
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

    return cardElement;
  });

  galleryContainer.replaceChildren(...cards);
});

// Обработка изменения выбранного товара для просмотра
catalogModel.on("preview:changed", () => {
  const preview = catalogModel.getPreview();
  if (!preview) {
    // Если preview сброшен, закрываем модальное окно, если оно открыто с preview
    if (modal.hasContentType("cardPreview")) {
      modal.close();
    }
    return;
  }

  const previewElement = cloneTemplate<HTMLElement>(cardPreviewTemplate);
  createCardPreview(previewElement, preview, events, cartModel);

  modal.render({ content: previewElement });
  modal.open();
});

// Обработка изменения содержимого корзины
cartModel.on("items:changed", () => {
  const items = cartModel.getItems();
  const total = cartModel.getTotal();
  const count = cartModel.getCount();

  // Обновление счетчика в хедере
  header.render({ counter: count });

  // Обновление корзины (всегда, чтобы она была актуальной при открытии)
  const cardElements = items.map((item, index) => {
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

    return cardElement;
  });

  basket.render({
    items: cardElements,
    total: total,
  });

  // Обновление preview, если он открыт
  const preview = catalogModel.getPreview();
  if (preview && modal.hasContentType("cardPreview")) {
    // Получаем элемент
    const previewElement = modal.content;
    if (previewElement) {
      createCardPreview(previewElement, preview, events, cartModel);
    }
  }
});

// Обработка изменения данных покупателя
buyerModel.on("data:changed", () => {
  const data = buyerModel.getData();
  const allErrors = buyerModel.validate();

  // Обновление формы заказа (всегда, чтобы она была актуальной при открытии)
  const orderErrors = {
    payment: allErrors.payment,
    address: allErrors.address,
  };
  order.render({
    payment: data.payment,
    address: data.address,
    errors: orderErrors,
  });
  order.valid = !orderErrors.payment && !orderErrors.address;

  // Обновление формы контактов (всегда, чтобы она была актуальной при открытии)
  contacts.render({
    email: data.email,
    phone: data.phone,
    errors: { email: allErrors.email, phone: allErrors.phone },
  });
  contacts.valid = !allErrors.email && !allErrors.phone;
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
  }
});

// Удаление товара из корзины
events.on("card:remove", (data: { id: string }) => {
  const product = catalogModel.getItemById(data.id);
  if (product) {
    cartModel.removeItem(product);
  }
});

// Открытие корзины
events.on("basket:open", () => {
  // Корзина обновляется через событие items:changed от модели Cart
  // Здесь только открываем модальное окно
  modal.render({ content: basketElement });
  modal.open();
});

// Оформление заказа
events.on("basket:order", () => {
  // Форма заказа обновляется через событие data:changed от модели Buyer
  // Здесь только открываем модальное окно с формой заказа
  modal.render({ content: orderElement });
});

// Переход ко второй форме оформления заказа
events.on("order:next", () => {
  const allErrors = buyerModel.validate();
  const orderErrors = {
    payment: allErrors.payment,
    address: allErrors.address,
  };
  const isOrderValid = !orderErrors.payment && !orderErrors.address;

  if (!isOrderValid) {
    // Форма заказа обновляется через событие data:changed от модели Buyer
    // Здесь только проверяем валидность и не переходим дальше
    return;
  }

  // Переходим к форме контактов
  // Форма контактов обновляется через событие data:changed от модели Buyer
  // Здесь только открываем модальное окно с формой контактов
  modal.render({ content: contactsElement });
});

// Завершение оформления заказа
events.on("contacts:submit", async () => {
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

    // Очищаем корзину и данные покупателя
    // Модели отправят события об изменении, представления обновятся автоматически
    cartModel.clear();
    buyerModel.clear();

    // Показываем окно успеха (открытие модального окна)
    success.render({ total: response.total });
    modal.render({ content: successElement });
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
