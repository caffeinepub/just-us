import Text "mo:core/Text";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  // User Profile Type
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
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

  // Types
  type SpecialDate = {
    title : Text;
    date : Time.Time;
    description : Text;
    emoji : Text;
    category : Text;
  };

  type Moment = {
    id : Nat;
    caption : Text;
    date : Time.Time;
    photo : Storage.ExternalBlob;
  };

  type Message = {
    sender : Text;
    message : Text;
    timestamp : Time.Time;
  };

  type GamePrompt = {
    prompt : Text;
    gameType : Text; // "would_you_rather" or "truth_or_dare"
  };

  module SpecialDate {
    public func compare(date1 : SpecialDate, date2 : SpecialDate) : Order.Order {
      Int.compare(date1.date, date2.date);
    };
  };

  module Message {
    public func compareByTimestamp(message1 : Message, message2 : Message) : Order.Order {
      Int.compare(message1.timestamp, message2.timestamp);
    };
  };

  // State
  let specialDates = Map.empty<Nat, SpecialDate>();
  let moments = Map.empty<Nat, Moment>();
  let messages = List.empty<Message>();
  let gamePrompts = Map.empty<Nat, GamePrompt>();
  var nextMomentId = 0;
  var nextGamePromptId = 0;
  var nextSpecialDateId = 0;
  var loveNote = "You are my everything ❤️";

  //////////////////////////////////////////
  // Special Dates CRUD
  public shared ({ caller }) func createSpecialDate(title : Text, date : Time.Time, description : Text, emoji : Text, category : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create special dates");
    };
    let id = nextSpecialDateId;
    let newDate : SpecialDate = {
      title;
      date;
      description;
      emoji;
      category;
    };
    specialDates.add(id, newDate);
    nextSpecialDateId += 1;
    id;
  };

  public shared ({ caller }) func updateSpecialDate(id : Nat, title : Text, date : Time.Time, description : Text, emoji : Text, category : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update special dates");
    };
    switch (specialDates.get(id)) {
      case (?_) {
        let updatedDate : SpecialDate = {
          title;
          date;
          description;
          emoji;
          category;
        };
        specialDates.add(id, updatedDate);
      };
      case (null) { Runtime.trap("Special date not found") };
    };
  };

  public shared ({ caller }) func deleteSpecialDate(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete special dates");
    };
    if (not specialDates.containsKey(id)) {
      Runtime.trap("Special date not found");
    };
    specialDates.remove(id);
  };

  public query ({ caller }) func getUpcomingSpecialDates() : async [SpecialDate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view special dates");
    };
    let now = Time.now();
    let allDates = specialDates.values().toArray();
    allDates.filter(
      func(d) {
        d.date >= now;
      }
    ).sort();
  };

  //////////////////////////////////////////
  // Moments CRUD
  public shared ({ caller }) func createMoment(caption : Text, date : Time.Time, photo : Storage.ExternalBlob) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create moments");
    };
    let id = nextMomentId;
    let newMoment : Moment = { id; caption; date; photo };
    moments.add(id, newMoment);
    nextMomentId += 1;
    id;
  };

  public shared ({ caller }) func updateMoment(id : Nat, caption : Text, date : Time.Time) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update moments");
    };
    switch (moments.get(id)) {
      case (?moment) {
        let updatedMoment : Moment = {
          id;
          caption;
          date;
          photo = moment.photo;
        };
        moments.add(id, updatedMoment);
      };
      case (null) { Runtime.trap("Moment not found") };
    };
  };

  public shared ({ caller }) func deleteMoment(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete moments");
    };
    if (not moments.containsKey(id)) {
      Runtime.trap("Moment not found");
    };
    moments.remove(id);
  };

  public query ({ caller }) func getAllMoments() : async [Moment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view moments");
    };
    moments.values().toArray();
  };

  //////////////////////////////////////////
  // Chat Messages
  public shared ({ caller }) func sendMessage(sender : Text, message : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    let newMessage : Message = {
      sender;
      message;
      timestamp = Time.now();
    };
    messages.add(newMessage);

    // Keep only last 100 messages
    while (messages.size() > 100) {
      ignore messages.removeLast();
    };
  };

  public query ({ caller }) func getMessages() : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    messages.toArray().reverse();
  };

  //////////////////////////////////////////
  // Game Prompts
  public shared ({ caller }) func addGamePrompt(prompt : Text, gameType : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add game prompts");
    };
    let id = nextGamePromptId;
    let newPrompt : GamePrompt = { prompt; gameType };
    gamePrompts.add(id, newPrompt);
    nextGamePromptId += 1;
  };

  public query ({ caller }) func getRandomPrompt(gameType : Text) : async ?GamePrompt {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get game prompts");
    };
    let filteredPrompts = gamePrompts.values().toArray().filter(
      func(p) { p.gameType == gameType }
    );

    if (filteredPrompts.size() == 0) {
      return null;
    };

    let randomIndex = 0; // Replace with real random if possible
    ?filteredPrompts[randomIndex % filteredPrompts.size()];
  };

  //////////////////////////////////////////
  // Love Notes
  public shared ({ caller }) func updateLoveNote(note : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update love notes");
    };
    loveNote := note;
  };

  public query ({ caller }) func getLoveNote() : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view love notes");
    };
    loveNote;
  };

  //////////////////////////////////////////
  // Initial Game Prompts Seeding
  public shared ({ caller }) func seedGamePrompts() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can seed game prompts");
    };
    let wouldYouRather = [
      "Would you rather travel to the future or the past?",
      "Would you rather always be too hot or too cold?",
      "Would you rather have breakfast for every meal or dessert for every meal?",
      "Would you rather go skydiving or bungee jumping?",
      "Would you rather live in a treehouse or a houseboat?",
      "Would you rather have unlimited pizza or unlimited ice cream?",
      "Would you rather be famous for singing or dancing?",
      "Would you rather have a pet dragon or unicorn?",
      "Would you rather teleport anywhere or read minds?",
      "Would you rather always speak in rhyme or sing everything?",
    ];

    let truthOrDare = [
      "What is your biggest fear?",
      "What's a secret you've never told anyone?",
      "What's the most embarrassing thing you've done?",
      "What's your biggest guilty pleasure?",
      "Describe your perfect date.",
      "Dance like no one is watching for 30 seconds.",
      "Do your best impression of your partner.",
      "Sing the chorus of your favorite love song.",
      "Do 10 jumping jacks.",
      "Tell your partner why you love them.",
    ];

    for (prompt in wouldYouRather.values()) {
      let id = nextGamePromptId;
      let newPrompt : GamePrompt = { prompt; gameType = "would_you_rather" };
      gamePrompts.add(id, newPrompt);
      nextGamePromptId += 1;
    };

    for (prompt in truthOrDare.values()) {
      let id = nextGamePromptId;
      let newPrompt : GamePrompt = { prompt; gameType = "truth_or_dare" };
      gamePrompts.add(id, newPrompt);
      nextGamePromptId += 1;
    };
  };
};
