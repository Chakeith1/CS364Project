CREATE TABLE addresses (
  address_id SERIAL PRIMARY KEY,
  street varchar(255),
  city varchar(255),
  state varchar(255),
  zip_code varchar(20),
  country varchar(255)
);

CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  email varchar(255),
  password_hash varchar(255),
  name varchar(255),
  address_id int,
  is_admin boolean DEFAULT false,
  FOREIGN KEY (address_id) REFERENCES addresses(address_id)
);

CREATE TABLE products (
	product_id int PRIMARY KEY,
	name varchar(255),
	description text,
	price decimal(10,2),
	stock_quantity int,
	low_stock_threshold int
);

CREATE TABLE orders (
	order_id int PRIMARY KEY,
	user_id int,
	total_amount decimal(10,2),
	FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE orderitems (
	order_item_id int PRIMARY KEY,
	order_id int,
	product_id int,
	quantity int,
	price decimal(10,2),
	FOREIGN KEY (order_id) REFERENCES orders(order_id),
	FOREIGN KEY (product_id) REFERENCES products(product_id)
);

CREATE TABLE purchaselimits (
	address_id int,
	product_id int,
	total_purchased int,
	PRIMARY KEY (address_id, product_id),
	FOREIGN KEY (address_id) REFERENCES addresses(address_id),
	FOREIGN KEY (product_id) REFERENCES products(product_id)
);