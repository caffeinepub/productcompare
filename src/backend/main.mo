import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Float "mo:core/Float";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Order "mo:core/Order";

actor {
  type Feature = {
    name : Text;
    value : Text;
    included : Bool;
  };

  type Variant = {
    id : Nat;
    productId : Nat;
    name : Text;
    price : Float;
    features : [Feature];
  };

  module Variant {
    public func compare(variant1 : Variant, variant2 : Variant) : Order.Order {
      Nat.compare(variant1.id, variant2.id);
    };
  };

  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    category : Text;
    imageUrl : Text;
  };

  module Product {
    public func compare(product1 : Product, product2 : Product) : Order.Order {
      Nat.compare(product1.id, product2.id);
    };
  };

  let productStore = Map.empty<Nat, Product>();
  let variantStore = Map.empty<Nat, Variant>();

  var nextProductId = 1;
  var nextVariantId = 1;
  var seeded = false;

  public shared ({ caller }) func seedData() : async () {
    if (seeded) { return () };

    let laptop : Product = {
      id = nextProductId;
      name = "UltraBook Pro";
      description = "High-performance laptop for professionals.";
      category = "Laptops";
      imageUrl = "https://example.com/laptop.jpg";
    };
    productStore.add(laptop.id, laptop);
    nextProductId += 1;

    let smartphone : Product = {
      id = nextProductId;
      name = "SmartX Plus";
      description = "Feature-rich smartphone with advanced camera.";
      category = "Smartphones";
      imageUrl = "https://example.com/smartphone.jpg";
    };
    productStore.add(smartphone.id, smartphone);
    nextProductId += 1;

    let laptopVariants : [Variant] = [
      {
        id = nextVariantId;
        productId = laptop.id;
        name = "Basic";
        price = 999.99;
        features = [
          { name = "RAM"; value = "8GB"; included = true },
          { name = "Storage"; value = "256GB SSD"; included = true },
          { name = "Display"; value = "13 inch"; included = true },
          { name = "Touchscreen"; value = "No"; included = false },
          { name = "Battery Life"; value = "8 hours"; included = true },
        ];
      },
      {
        id = nextVariantId + 1;
        productId = laptop.id;
        name = "Pro";
        price = 1499.99;
        features = [
          { name = "RAM"; value = "16GB"; included = true },
          { name = "Storage"; value = "512GB SSD"; included = true },
          { name = "Display"; value = "15 inch"; included = true },
          { name = "Touchscreen"; value = "Yes"; included = true },
          { name = "Battery Life"; value = "10 hours"; included = true },
        ];
      },
      {
        id = nextVariantId + 2;
        productId = laptop.id;
        name = "Elite";
        price = 1999.99;
        features = [
          { name = "RAM"; value = "32GB"; included = true },
          { name = "Storage"; value = "1TB SSD"; included = true },
          { name = "Display"; value = "17 inch"; included = true },
          { name = "Touchscreen"; value = "Yes"; included = true },
          { name = "Battery Life"; value = "12 hours"; included = true },
        ];
      },
    ];

    let smartphoneVariants : [Variant] = [
      {
        id = nextVariantId + 3;
        productId = smartphone.id;
        name = "Standard";
        price = 699.99;
        features = [
          { name = "RAM"; value = "4GB"; included = true },
          { name = "Storage"; value = "64GB"; included = true },
          { name = "Camera"; value = "12MP"; included = true },
          { name = "5G"; value = "No"; included = false },
          { name = "Battery Life"; value = "24 hours"; included = true },
        ];
      },
      {
        id = nextVariantId + 4;
        productId = smartphone.id;
        name = "Plus";
        price = 899.99;
        features = [
          { name = "RAM"; value = "6GB"; included = true },
          { name = "Storage"; value = "128GB"; included = true },
          { name = "Camera"; value = "48MP"; included = true },
          { name = "5G"; value = "Yes"; included = true },
          { name = "Battery Life"; value = "30 hours"; included = true },
        ];
      },
      {
        id = nextVariantId + 5;
        productId = smartphone.id;
        name = "Max";
        price = 1099.99;
        features = [
          { name = "RAM"; value = "8GB"; included = true },
          { name = "Storage"; value = "256GB"; included = true },
          { name = "Camera"; value = "108MP"; included = true },
          { name = "5G"; value = "Yes"; included = true },
          { name = "Battery Life"; value = "36 hours"; included = true },
        ];
      },
    ];

    for (variant in laptopVariants.values()) {
      variantStore.add(variant.id, variant);
      nextVariantId += 1;
    };
    for (variant in smartphoneVariants.values()) {
      variantStore.add(variant.id, variant);
      nextVariantId += 1;
    };

    seeded := true;
  };

  public shared ({ caller }) func addProduct(name : Text, description : Text, category : Text, imageUrl : Text) : async Product {
    let product : Product = {
      id = nextProductId;
      name;
      description;
      category;
      imageUrl;
    };
    productStore.add(product.id, product);
    nextProductId += 1;
    product;
  };

  public shared ({ caller }) func updateProduct(id : Nat, name : Text, description : Text, category : Text, imageUrl : Text) : async Product {
    switch (productStore.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?_) {
        let updatedProduct : Product = {
          id;
          name;
          description;
          category;
          imageUrl;
        };
        productStore.add(id, updatedProduct);
        updatedProduct;
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    if (not productStore.containsKey(id)) { Runtime.trap("Product not found") };
    productStore.remove(id);
  };

  public query ({ caller }) func getProduct(id : Nat) : async Product {
    switch (productStore.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { product };
    };
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    productStore.values().toArray().sort();
  };

  public shared ({ caller }) func addVariant(productId : Nat, name : Text, price : Float, features : [Feature]) : async Variant {
    if (not productStore.containsKey(productId)) { Runtime.trap("Product not found") };

    let variant : Variant = {
      id = nextVariantId;
      productId;
      name;
      price;
      features;
    };
    variantStore.add(variant.id, variant);
    nextVariantId += 1;
    variant;
  };

  public shared ({ caller }) func updateVariant(id : Nat, productId : Nat, name : Text, price : Float, features : [Feature]) : async Variant {
    switch (variantStore.get(id)) {
      case (null) { Runtime.trap("Variant not found") };
      case (?_) {
        let updatedVariant : Variant = {
          id;
          productId;
          name;
          price;
          features;
        };
        variantStore.add(id, updatedVariant);
        updatedVariant;
      };
    };
  };

  public shared ({ caller }) func deleteVariant(id : Nat) : async () {
    if (not variantStore.containsKey(id)) { Runtime.trap("Variant not found") };
    variantStore.remove(id);
  };

  public query ({ caller }) func getVariant(id : Nat) : async Variant {
    switch (variantStore.get(id)) {
      case (null) { Runtime.trap("Variant not found") };
      case (?variant) { variant };
    };
  };

  public query ({ caller }) func getVariantsByProductId(productId : Nat) : async [Variant] {
    variantStore.values().toArray().filter(
      func(variant) { variant.productId == productId }
    ).sort();
  };
};
