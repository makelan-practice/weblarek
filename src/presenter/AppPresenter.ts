import { Catalog } from "../models/Catalog";
import { Cart } from "../models/Cart";
import { Buyer } from "../models/Buyer";
import { ShopAPI } from "../api/ShopAPI";
import { Gallery } from "../components/Gallery";
import { Header } from "../components/Header";
import { Modal } from "../components/Modal";
import { CatalogCard, PreviewCard } from "../components/Card";
import { Basket } from "../components/Basket";
import { BasketItem } from "../components/BasketItem";
import { OrderForm, IOrderFormState } from "../components/forms/OrderForm";
import {
  ContactsForm,
  IContactsFormState,
} from "../components/forms/ContactsForm";
import { Success } from "../components/Success";
import { cloneTemplate } from "../utils/utils";
import { IProduct, IOrderRequest } from "../types";
import { IEvents } from "../components/base/Events";

type ModalView = "preview" | "basket" | "order" | "contacts" | "success" | null;

interface AppPresenterDeps {
  catalog: Catalog;
  cart: Cart;
  buyer: Buyer;
  api: ShopAPI;
  gallery: Gallery;
  header: Header;
  modal: Modal;
  events: IEvents;
}

/**
 * Связывает модели, представления и API, реализуя сценарии приложения
 */
export class AppPresenter {
  protected catalog: Catalog;
  protected cart: Cart;
  protected buyer: Buyer;
  protected api: ShopAPI;
  protected gallery: Gallery;
  protected header: Header;
  protected modal: Modal;
  protected events: IEvents;

  protected basketComponent?: Basket;
  protected orderComponent?: OrderForm;
  protected contactsComponent?: ContactsForm;
  protected successComponent?: Success;
  protected currentView: ModalView = null;

  constructor({
    catalog,
    cart,
    buyer,
    api,
    gallery,
    header,
    modal,
    events,
  }: AppPresenterDeps) {
    this.catalog = catalog;
    this.cart = cart;
    this.buyer = buyer;
    this.api = api;
    this.gallery = gallery;
    this.header = header;
    this.modal = modal;
    this.events = events;
  }

  init() {
    this.subscribeToModelEvents();
    this.subscribeToViewEvents();
    this.loadCatalog();
    this.header.render({
      counter: this.cart.getCount(),
    });
  }

  handleModalClose = () => {
    this.currentView = null;
    this.basketComponent = undefined;
    this.orderComponent = undefined;
    this.contactsComponent = undefined;
    this.successComponent = undefined;
  };

  protected subscribeToViewEvents() {
    this.events.on("basket:open", () => this.openBasket());
    this.events.on("basket:checkout", () => this.openOrderStep());

    this.events.on<{ id: string }>("card:select", ({ id }) => {
      const product = this.catalog.getItemById(id);
      if (product) {
        this.catalog.setPreview(product);
      }
    });

    this.events.on<{ id: string }>("card:toggle-cart", ({ id }) => {
      const product = this.catalog.getItemById(id);
      if (!product || product.price === null) {
        return;
      }
      if (this.cart.contains(id)) {
        this.cart.removeItem(product);
      } else {
        this.cart.addItem(product);
      }
      this.modal.close();
    });

    this.events.on<{ id: string }>("cart:item-remove", ({ id }) => {
      const product = this.cart.getItems().find((item) => item.id === id);
      if (product) {
        this.cart.removeItem(product);
      }
    });

    this.events.on<Partial<IOrderFormState>>("order:change", (data) =>
      this.handleOrderChange(data)
    );
    this.events.on<IOrderFormState>("order:submit", () =>
      this.openContactsStep()
    );

    this.events.on<Partial<IContactsFormState>>("contacts:change", (data) =>
      this.handleContactsChange(data)
    );
    this.events.on<IContactsFormState>("contacts:submit", () =>
      this.submitOrder()
    );
  }

  protected subscribeToModelEvents() {
    this.catalog.on("items:changed", ({ items }: { items: IProduct[] }) => {
      this.renderCatalog(items);
    });

    this.catalog.on("preview:changed", ({ preview }: { preview: IProduct }) => {
      if (preview) {
        this.openPreview(preview);
      }
    });

    this.cart.on("items:changed", () => {
      this.header.render({ counter: this.cart.getCount() });
      if (this.currentView === "basket" && this.basketComponent) {
        this.updateBasketComponent();
      }
    });
  }

  protected loadCatalog() {
    this.api
      .getProductList()
      .then(({ items }) => this.catalog.setItems(items))
      .catch((error) => console.error("Не удалось загрузить каталог", error));
  }

  protected renderCatalog(items: IProduct[]) {
    const cardNodes = items.map((item) => {
      const card = new CatalogCard(
        cloneTemplate<HTMLButtonElement>("#card-catalog"),
        {
          onClick: () => this.events.emit("card:select", { id: item.id }),
        }
      );

      return card.render({
        id: item.id,
        title: item.title,
        category: item.category,
        price: item.price,
        image: item.image,
      });
    });

    this.gallery.render({ items: cardNodes });
  }

  protected openPreview(product: IProduct) {
    const isInCart = this.cart.contains(product.id);
    const isUnavailable = product.price === null;
    const buttonTitle = isUnavailable
      ? "Unavailable"
      : isInCart
        ? "Удалить из корзины"
        : "Купить";

    const card = new PreviewCard(cloneTemplate<HTMLElement>("#card-preview"), {
      onButtonClick: () => {
        if (!isUnavailable) {
          this.events.emit("card:toggle-cart", { id: product.id });
        }
      },
    });

    const element = card.render({
      id: product.id,
      title: product.title,
      category: product.category,
      price: product.price,
      image: product.image,
      description: product.description,
      buttonTitle,
      buttonDisabled: isUnavailable,
    });

    this.modal.open(element);
    this.currentView = "preview";
  }

  protected buildBasketItems(): HTMLElement[] {
    return this.cart.getItems().map((item, index) => {
      const card = new BasketItem(cloneTemplate<HTMLElement>("#card-basket"), {
        onDelete: () => this.events.emit("cart:item-remove", { id: item.id }),
      });

      return card.render({
        id: item.id,
        title: item.title,
        price: item.price,
        category: item.category,
        index: index + 1,
      });
    });
  }

  protected updateBasketComponent() {
    if (!this.basketComponent) return;
    this.basketComponent.items = this.buildBasketItems();
    this.basketComponent.total = this.cart.getTotal();
    this.basketComponent.buttonDisabled = this.cart.getCount() === 0;
  }

  protected openBasket() {
    this.basketComponent = new Basket(cloneTemplate<HTMLElement>("#basket"), {
      onSubmit: () => this.events.emit("basket:checkout"),
    });

    const element = this.basketComponent.render({
      items: this.buildBasketItems(),
      total: this.cart.getTotal(),
      buttonDisabled: this.cart.getCount() === 0,
    });

    this.modal.open(element);
    this.currentView = "basket";
  }

  protected openOrderStep() {
    this.orderComponent = new OrderForm(
      cloneTemplate<HTMLFormElement>("#order"),
      {
        onSubmit: (formData) => this.events.emit("order:submit", formData),
        onChange: (data) => this.events.emit("order:change", data),
      }
    );

    const buyerData = this.buyer.getData();
    if (buyerData.payment) {
      this.orderComponent.payment = buyerData.payment;
    }
    if (buyerData.address) {
      this.orderComponent.address = buyerData.address;
    }

    const element = this.orderComponent.render({
      payment: buyerData.payment,
      address: buyerData.address,
      errors: "",
    });
    this.updateOrderValidation();
    this.modal.open(element);

    this.currentView = "order";
  }

  protected handleOrderChange(data: Partial<IOrderFormState>) {
    if (typeof data.payment !== "undefined" && data.payment !== null) {
      this.buyer.setPayment(data.payment);
    }

    if (typeof data.address !== "undefined") {
      this.buyer.setAddress(data.address);
    }

    this.updateOrderValidation();
  }

  protected updateOrderValidation(message?: string) {
    if (!this.orderComponent) return;
    const error = message ?? this.getOrderError();
    this.orderComponent.errors = error ?? "";
    this.orderComponent.valid = !error;
  }

  protected getOrderError(): string | null {
    const buyerData = this.buyer.getData();
    if (!buyerData.payment) {
      return "Выберите способ оплаты";
    }
    if (!buyerData.address) {
      return "Укажите адрес доставки";
    }
    return null;
  }

  protected openContactsStep() {
    if (
      !this.orderComponent ||
      !this.orderComponent.value.payment ||
      !this.orderComponent.value.address
    ) {
      this.updateOrderValidation();
      return;
    }

    this.contactsComponent = new ContactsForm(
      cloneTemplate<HTMLFormElement>("#contacts"),
      {
        onSubmit: (formData) => this.events.emit("contacts:submit", formData),
        onChange: (data) => this.events.emit("contacts:change", data),
      }
    );

    const buyerData = this.buyer.getData();
    if (buyerData.email) this.contactsComponent.email = buyerData.email;
    if (buyerData.phone) this.contactsComponent.phone = buyerData.phone;

    const element = this.contactsComponent.render({
      email: buyerData.email,
      phone: buyerData.phone,
      errors: "",
    });
    this.updateContactsValidation();
    this.modal.open(element);

    this.currentView = "contacts";
  }

  protected handleContactsChange(data: Partial<IContactsFormState>) {
    if (typeof data.email !== "undefined") {
      this.buyer.setEmail(data.email);
    }
    if (typeof data.phone !== "undefined") {
      this.buyer.setPhone(data.phone);
    }
    this.updateContactsValidation();
  }

  protected updateContactsValidation(message?: string) {
    if (!this.contactsComponent) return;
    const error = message ?? this.getContactsError();
    this.contactsComponent.errors = error ?? "";
    this.contactsComponent.valid = !error;
  }

  protected getContactsError(): string | null {
    const buyerData = this.buyer.getData();
    if (!buyerData.email) {
      return "Укажите email";
    }
    if (!buyerData.phone) {
      return "Укажите телефон";
    }
    return null;
  }

  protected submitOrder() {
    if (!this.contactsComponent) return;
    const buyerData = this.buyer.getData();
    const total = this.cart.getTotal();
    const items = this.cart.getItems().map((item) => item.id);

    const order: IOrderRequest = {
      payment: buyerData.payment,
      email: buyerData.email,
      phone: buyerData.phone,
      address: buyerData.address,
      total,
      items,
    };

    this.contactsComponent.valid = false;
    this.contactsComponent.errors = "Отправляем заказ...";

    this.api
      .createOrder(order)
      .then((response) => {
        this.cart.clear();
        this.buyer.clear();
        this.showSuccess(response.total);
      })
      .catch((error) => {
        this.updateContactsValidation(`Ошибка: ${error}`);
      });
  }

  protected showSuccess(total: number) {
    this.successComponent = new Success(
      cloneTemplate<HTMLElement>("#success"),
      {
        onClose: () => this.modal.close(),
      }
    );

    const element = this.successComponent.render({
      total,
    });

    this.modal.open(element);
    this.currentView = "success";
  }
}
