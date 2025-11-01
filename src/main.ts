import './scss/styles.scss';
import { Catalog } from './models/Catalog';
import { Cart } from './models/Cart';
import { Buyer } from './models/Buyer';
import { apiProducts } from './utils/data';

// ============ Тестирование моделей данных ============

console.log('=== Тестирование модели Catalog ===');

const catalogModel = new Catalog();
catalogModel.setItems(apiProducts.items);
console.log('Массив товаров из каталога:', catalogModel.getItems());
console.log('Количество товаров в каталоге:', catalogModel.getItems().length);

const firstProduct = catalogModel.getItemById(apiProducts.items[0].id);
console.log('Получен товар по ID:', firstProduct);

catalogModel.setPreview(firstProduct!);
console.log('Выбран товар для preview:', catalogModel.getPreview());

// ============ Тестирование модели Cart ============

console.log('\n=== Тестирование модели Cart ===');

const cartModel = new Cart();
console.log('Товаров в корзине:', cartModel.getCount());
console.log('Сумма корзины:', cartModel.getTotal());

cartModel.addItem(apiProducts.items[0]);
console.log('Добавлен товар в корзину. Товаров в корзине:', cartModel.getCount());
console.log('Сумма корзины:', cartModel.getTotal());

cartModel.addItem(apiProducts.items[1]);
console.log('Добавлен ещё товар. Товаров в корзине:', cartModel.getCount());
console.log('Товары в корзине:', cartModel.getItems().map(item => ({ id: item.id, title: item.title, price: item.price })));

const isInCart = cartModel.contains(apiProducts.items[0].id);
console.log('Товар с ID', apiProducts.items[0].id, 'в корзине:', isInCart);

cartModel.removeItem(apiProducts.items[0]);
console.log('Удалён товар. Товаров в корзине:', cartModel.getCount());
console.log('Сумма корзины:', cartModel.getTotal());

cartModel.clear();
console.log('Корзина очищена. Товаров в корзине:', cartModel.getCount());
console.log('Сумма корзины:', cartModel.getTotal());

// ============ Тестирование модели Buyer ============

console.log('\n=== Тестирование модели Buyer ===');

const buyerModel = new Buyer();
console.log('Данные покупателя:', buyerModel.getData());

buyerModel.setPayment('online');
console.log('Установлен способ оплаты:', buyerModel.getData().payment);

buyerModel.setAddress('г. Москва, ул. Примерная, д. 1');
console.log('Установлен адрес:', buyerModel.getData().address);

buyerModel.setEmail('test@example.com');
console.log('Установлен email:', buyerModel.getData().email);

buyerModel.setPhone('+7 (999) 123-45-67');
console.log('Все данные покупателя:', buyerModel.getData());

const validationErrors = buyerModel.validate();
console.log('Ошибки валидации (должно быть 0):', Object.keys(validationErrors).length);

buyerModel.clear();
console.log('Данные очищены:', buyerModel.getData());

const validationErrorsAfterClear = buyerModel.validate();
console.log('Ошибки валидации после очистки:', validationErrorsAfterClear);
console.log('Количество ошибок:', Object.keys(validationErrorsAfterClear).length);

// Частичное обновление данных
buyerModel.setData({ payment: 'offline', email: 'partial@example.com' });
console.log('Частичное обновление данных:', buyerModel.getData());

buyerModel.setData({ address: 'г. СПб, пр. Невский, д. 100', phone: '+7 (812) 555-00-00' });
console.log('Добавлены остальные данные:', buyerModel.getData());

console.log('\n=== Тестирование завершено ===');

// ============ Тестирование работы с сервером ============

console.log('\n=== Тестирование ShopAPI ===');

import { Api } from './components/base/Api';
import { ShopAPI } from './api/ShopAPI';
import { API_URL } from './utils/constants';

console.log('API_URL:', API_URL);

const api = new Api(API_URL);
const shopApi = new ShopAPI(api);

shopApi.getProductList()
  .then(data => {
    console.log('Получен каталог товаров с сервера:', data);
    console.log('Количество товаров:', data.items.length);
    
    // Сохраняем в модель каталога
    catalogModel.setItems(data.items);
    console.log('Каталог сохранен в модель. Товаров в модели:', catalogModel.getItems().length);
    
    // Выводим первые 3 товара для проверки
    console.log('Первые 3 товара из каталога:');
    catalogModel.getItems().slice(0, 3).forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} - ${product.price} синапсов`);
    });
  })
  .catch(error => {
    console.error('Ошибка при получении каталога:', error);
  });

console.log('\n=== Тестирование API завершено ===');
