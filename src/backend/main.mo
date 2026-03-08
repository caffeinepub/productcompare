import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Persistent state using migration
actor {
  // Constants
  let OWNER_PRINCIPAL = "xkh5y-mmyoe-vquq7-42fdf-xmiwm-gqvrh-jzqej-4uqep-vogg2-yumzv-kae";

  // Car Categories
  public type CarCategory = {
    #sedan;
    #suv;
    #hatchback;
    #mpv;
    #coupe;
  };

  // Features
  public type Feature = {
    name : Text;
    value : Text;
    included : Bool;
  };

  // Car Models
  public type CarModel = {
    id : Nat;
    name : Text;
    description : Text;
    category : CarCategory;
    tagline : Text;
    imageUrl : Text;
  };

  module CarModel {
    public func compare(carModel1 : CarModel, carModel2 : CarModel) : Order.Order {
      Nat.compare(carModel1.id, carModel2.id);
    };
  };

  // Trim Variants
  public type Trim = {
    id : Nat;
    carModelId : Nat;
    name : Text;
    price : Float;
    monthlyEMI : Float;
    features : [Feature];
  };

  module Trim {
    public func compare(trim1 : Trim, trim2 : Trim) : Order.Order {
      Nat.compare(trim1.id, trim2.id);
    };
  };

  // User Profile
  public type UserProfile = {
    name : Text;
  };

  // State
  let carModelStore = Map.empty<Nat, CarModel>();
  let trimStore = Map.empty<Nat, Trim>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextCarModelId = 1;
  var nextTrimId = 1;
  var seeded = false;
  var adminAssigned = false;

  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Helper to check admin or owner
  func isAdminOrOwner(caller : Principal) : Bool {
    caller.toText() == OWNER_PRINCIPAL or AccessControl.isAdmin(accessControlState, caller);
  };

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isAdminOrOwner(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Exposed Internals (public queries, no authorization needed)
  public query ({ caller }) func isSeeded() : async Bool { seeded };
  public query ({ caller }) func getNextCarModelId() : async Nat { nextCarModelId };
  public query ({ caller }) func getNextTrimId() : async Nat { nextTrimId };
  public query ({ caller }) func getCallerPrincipal() : async Text { caller.toText() };

  // Helper functions to create objects
  func mkCarModel(
    name : Text,
    description : Text,
    category : CarCategory,
    tagline : Text,
    imageUrl : Text,
  ) : CarModel {
    {
      id = nextCarModelId;
      name;
      description;
      category;
      tagline;
      imageUrl;
    };
  };

  func mkFeature(name : Text, value : Text, included : Bool) : Feature {
    {
      name;
      value;
      included;
    };
  };

  func mkTrim(
    carModelId : Nat,
    name : Text,
    price : Float,
    monthlyEMI : Float,
    features : [Feature],
  ) : Trim {
    {
      id = nextTrimId;
      carModelId;
      name;
      price;
      monthlyEMI;
      features;
    };
  };

  func seedTrimsForCarModel(carModel : CarModel) {
    let trims : [Trim] = switch (carModel.category) {
      case (#sedan) {
        [
          mkTrim(carModel.id, "Classic", 25000.0, 350.0, [
            mkFeature("Engine", "2.0L Petrol", true),
            mkFeature("Transmission", "Automatic", true),
            mkFeature("Fuel Type", "Petrol", true),
            mkFeature("Mileage", "14", false),
            mkFeature("Top Speed", "200", true),
            mkFeature("Airbags", "4", true),
          ]),
          mkTrim(carModel.id, "Executive", 30000.0, 425.0, [
            mkFeature("Engine", "2.0L Petrol", true),
            mkFeature("Transmission", "Automatic", true),
            mkFeature("Fuel Type", "Petrol", true),
            mkFeature("Mileage", "14", false),
            mkFeature("Top Speed", "200", true),
            mkFeature("Airbags", "6", true),
            mkFeature("Sunroof", "true", true),
          ]),
          mkTrim(carModel.id, "Luxury", 35000.0, 500.0, [
            mkFeature("Engine", "2.5L Petrol", true),
            mkFeature("Transmission", "Automatic", true),
            mkFeature("Fuel Type", "Petrol", true),
            mkFeature("Mileage", "13", false),
            mkFeature("Top Speed", "220", true),
            mkFeature("Airbags", "8", true),
            mkFeature("Sunroof", "true", true),
            mkFeature("Leather Seats", "true", true),
          ]),
        ];
      };
      case (#suv) {
        [
          mkTrim(carModel.id, "Adventure", 30000.0, 425.0, [
            mkFeature("Engine", "2.2L Diesel", true),
            mkFeature("Transmission", "Manual", true),
            mkFeature("Fuel Type", "Diesel", true),
            mkFeature("Mileage", "12", false),
            mkFeature("Top Speed", "180", true),
            mkFeature("4WD", "true", true),
          ]),
          mkTrim(carModel.id, "Touring", 35000.0, 500.0, [
            mkFeature("Engine", "2.2L Diesel", true),
            mkFeature("Transmission", "Automatic", true),
            mkFeature("Fuel Type", "Diesel", true),
            mkFeature("Mileage", "12", false),
            mkFeature("Top Speed", "180", true),
            mkFeature("4WD", "true", true),
            mkFeature("Sunroof", "true", true),
          ]),
          mkTrim(carModel.id, "Elite", 40000.0, 575.0, [
            mkFeature("Engine", "2.5L Petrol", true),
            mkFeature("Transmission", "Automatic", true),
            mkFeature("Fuel Type", "Petrol", true),
            mkFeature("Mileage", "11", false),
            mkFeature("Top Speed", "200", true),
            mkFeature("4WD", "true", true),
            mkFeature("Sunroof", "true", true),
            mkFeature("Leather Seats", "true", true),
          ]),
        ];
      };
      case (#hatchback) {
        [
          mkTrim(carModel.id, "Urban", 15000.0, 200.0, [
            mkFeature("Engine", "1.2L Petrol", true),
            mkFeature("Transmission", "Manual", true),
            mkFeature("Fuel Type", "Petrol", true),
            mkFeature("Mileage", "18", false),
            mkFeature("Top Speed", "160", true),
          ]),
          mkTrim(carModel.id, "Sport", 18000.0, 240.0, [
            mkFeature("Engine", "1.5L Petrol", true),
            mkFeature("Transmission", "Automatic", true),
            mkFeature("Fuel Type", "Petrol", true),
            mkFeature("Mileage", "17", false),
            mkFeature("Top Speed", "170", true),
            mkFeature("Cruise Control", "true", true),
          ]),
          mkTrim(carModel.id, "Eco", 17000.0, 225.0, [
            mkFeature("Engine", "1.2L Petrol", true),
            mkFeature("Transmission", "Manual", true),
            mkFeature("Fuel Type", "Petrol", true),
            mkFeature("Mileage", "19", false),
            mkFeature("Top Speed", "160", true),
            mkFeature("Start-Stop System", "true", true),
          ]),
        ];
      };
      case (_) { [] };
    };

    for (trim in trims.values()) {
      trimStore.add(trim.id, trim);
      nextTrimId += 1;
    };
  };

  // Seed Data (admin/owner only)
  public shared ({ caller }) func seedData() : async () {
    if (not isAdminOrOwner(caller)) {
      Runtime.trap("Unauthorized: Only admins can seed data");
    };

    // Only seed if not already done
    if (seeded) { return () };

    let carModels : [CarModel] = [
      mkCarModel(
        "Imperial Sedan",
        "A premium sedan combining luxury, comfort, and performance.",
        #sedan,
        "Where Elegance Meets Performance",
        "https://example.com/sedan.jpg",
      ),
      mkCarModel(
        "Summit SUV",
        "A versatile SUV built for adventure and family journeys.",
        #suv,
        "Conquer Every Terrain",
        "https://example.com/suv.jpg",
      ),
      mkCarModel(
        "City Sprint Hatchback",
        "A compact hatchback designed for urban efficiency and agility.",
        #hatchback,
        "Master the City Streets",
        "https://example.com/hatchback.jpg",
      ),
    ];

    for (carModel in carModels.values()) {
      carModelStore.add(carModel.id, carModel);
      nextCarModelId += 1;
    };

    // Seed trims for each car model
    for (carModel in carModels.values()) {
      seedTrimsForCarModel(carModel);
    };

    seeded := true;
  };

  // Car Model CRUD (admin/owner only)
  public shared ({ caller }) func addCarModel(
    name : Text,
    description : Text,
    category : CarCategory,
    tagline : Text,
    imageUrl : Text,
  ) : async CarModel {
    if (not isAdminOrOwner(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    let carModel = {
      id = nextCarModelId;
      name;
      description;
      category;
      tagline;
      imageUrl;
    };
    carModelStore.add(carModel.id, carModel);
    nextCarModelId += 1;
    carModel;
  };

  public shared ({ caller }) func updateCarModel(
    id : Nat,
    name : Text,
    description : Text,
    category : CarCategory,
    tagline : Text,
    imageUrl : Text,
  ) : async CarModel {
    if (not isAdminOrOwner(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (carModelStore.get(id)) {
      case (null) { Runtime.trap("Car model not found") };
      case (?_) {
        let updatedCarModel = {
          id;
          name;
          description;
          category;
          tagline;
          imageUrl;
        };
        carModelStore.add(id, updatedCarModel);
        updatedCarModel;
      };
    };
  };

  public shared ({ caller }) func deleteCarModel(id : Nat) : async () {
    if (not isAdminOrOwner(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not carModelStore.containsKey(id)) { Runtime.trap("Car model not found") };
    carModelStore.remove(id);
  };

  // Trim CRUD (admin/owner only)
  public shared ({ caller }) func addTrim(
    carModelId : Nat,
    name : Text,
    price : Float,
    monthlyEMI : Float,
    features : [Feature],
  ) : async Trim {
    if (not isAdminOrOwner(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not carModelStore.containsKey(carModelId)) { Runtime.trap("Car model not found") };

    let trim = {
      id = nextTrimId;
      carModelId;
      name;
      price;
      monthlyEMI;
      features;
    };
    trimStore.add(trim.id, trim);
    nextTrimId += 1;
    trim;
  };

  public shared ({ caller }) func updateTrim(
    id : Nat,
    carModelId : Nat,
    name : Text,
    price : Float,
    monthlyEMI : Float,
    features : [Feature],
  ) : async Trim {
    if (not isAdminOrOwner(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    switch (trimStore.get(id)) {
      case (null) { Runtime.trap("Trim not found") };
      case (?_) {
        let updatedTrim = {
          id;
          carModelId;
          name;
          price;
          monthlyEMI;
          features;
        };
        trimStore.add(id, updatedTrim);
        updatedTrim;
      };
    };
  };

  public shared ({ caller }) func deleteTrim(id : Nat) : async () {
    if (not isAdminOrOwner(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };

    if (not trimStore.containsKey(id)) { Runtime.trap("Trim not found") };
    trimStore.remove(id);
  };

  // Queries (public, no authorization needed)
  public query ({ caller }) func getCarModel(id : Nat) : async CarModel {
    switch (carModelStore.get(id)) {
      case (null) { Runtime.trap("Car model not found") };
      case (?carModel) { carModel };
    };
  };

  public query ({ caller }) func getAllCarModels() : async [CarModel] {
    carModelStore.values().toArray().sort();
  };

  public query ({ caller }) func getTrimsByCarModelId(carModelId : Nat) : async [Trim] {
    trimStore.values().toArray().filter(
      func(trim) { trim.carModelId == carModelId }
    ).sort();
  };

  public query ({ caller }) func getTrim(id : Nat) : async Trim {
    switch (trimStore.get(id)) {
      case (null) { Runtime.trap("Trim not found") };
      case (?trim) { trim };
    };
  };

  public query ({ caller }) func getTrimsByIds(trimIds : [Nat]) : async [Trim] {
    trimIds.map(
      func(trimId) {
        switch (trimStore.get(trimId)) {
          case (null) { Runtime.trap("Trim not found") };
          case (?trim) { trim };
        };
      }
    );
  };

  // Claim admin if none exists yet
  public shared ({ caller }) func claimAdminIfNoneExists() : async Bool {
    if (caller.isAnonymous()) {
      return false;
    };

    // Owner can always claim admin, even if adminAssigned is true
    if (caller.toText() == OWNER_PRINCIPAL) {
      AccessControl.assignRole(accessControlState, caller, caller, #admin);
      adminAssigned := true;
      return true;
    };

    // Non-owner can only claim if no admin has been assigned yet
    if (adminAssigned) {
      return false;
    };

    AccessControl.assignRole(accessControlState, caller, caller, #admin);
    adminAssigned := true;
    true;
  };

  // Reset admin (owner only)
  public shared ({ caller }) func resetAdmin() : async () {
    if (caller.toText() != OWNER_PRINCIPAL) {
      Runtime.trap("Unauthorized: Only the owner can perform this action");
    };

    accessControlState.userRoles.clear();
    adminAssigned := false;
  };
};
