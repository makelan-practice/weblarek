import './scss/styles.scss';
import { Catalog } from './models/Catalog';
import { Cart } from './models/Cart';
import { Buyer } from './models/Buyer';
import { Api } from './components/base/Api';
import { ShopAPI } from './api/ShopAPI';
import { API_URL } from './utils/constants';
import { Gallery } from './components/Gallery';
import { Header } from './components/Header';
import { Modal } from './components/Modal';
import { AppPresenter } from './presenter/AppPresenter';
import { ensureElement } from './utils/utils';
import { EventEmitter } from './components/base/Events';

const api = new Api(API_URL);
const shopApi = new ShopAPI(api);
const events = new EventEmitter();

const catalogModel = new Catalog();
const cartModel = new Cart();
const buyerModel = new Buyer();

const gallery = new Gallery(ensureElement<HTMLElement>('.gallery'));

let presenter: AppPresenter;

const header = new Header(ensureElement<HTMLElement>('.header'), {
  onBasketClick: () => events.emit('basket:open'),
});

const modal = new Modal(ensureElement<HTMLElement>('#modal-container'));

presenter = new AppPresenter({
  catalog: catalogModel,
  cart: cartModel,
  buyer: buyerModel,
  api: shopApi,
  gallery,
  header,
  modal,
  events,
});

modal.setCloseHandler(() => presenter.handleModalClose());

presenter.init();
