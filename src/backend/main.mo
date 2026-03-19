import Map "mo:core/Map";
import Time "mo:core/Time";
import Iter "mo:core/Iter";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";
import Nat64 "mo:core/Nat64";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Type declarations
  type Member = {
    id : Text;
    fullName : Text;
    phone : Text;
    joiningDate : Int;
    planDuration : Nat;
    feeAmount : Nat;
    paymentDate : Int;
    expiryDate : Int;
  };

  module Member {
    public func compare(member1 : Member, member2 : Member) : Order.Order {
      Text.compare(member1.id, member2.id);
    };
  };

  type DashboardStats = {
    totalMembers : Nat;
    activeMembers : Nat;
    expiredMembers : Nat;
    expiringSoon : Nat;
  };

  // Persistent data
  let members = Map.empty<Text, Member>();

  // Authorization
  // Set up access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public shared ({ caller }) func addMember(id : Text, fullName : Text, phone : Text, planDuration : Nat, feeAmount : Nat) : async () {
    // Check admin permissions
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add members");
    };
    if (members.containsKey(id)) { Runtime.trap("Member already exists") };
    let joiningDate = Time.now();
    let paymentDate = joiningDate;
    let expiryDate = calculateExpiryDate(joiningDate, planDuration);
    let member : Member = {
      id;
      fullName;
      phone;
      joiningDate;
      planDuration;
      feeAmount;
      paymentDate;
      expiryDate;
    };
    members.add(id, member);
  };

  // Update existing member
  public shared ({ caller }) func updateMember(updates : Member) : async () {
    // Check admin permissions
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update members");
    };
    if (not members.containsKey(updates.id)) { Runtime.trap("Member does not exist") };
    members.add(updates.id, updates);
  };

  // Delete member
  public shared ({ caller }) func deleteMember(id : Text) : async () {
    // Check admin permissions
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete members");
    };
    if (not members.containsKey(id)) { Runtime.trap("Member does not exist") };
    members.remove(id);
  };

  // Helper function to calculate expiry date
  func calculateExpiryDate(joiningDate : Int, planDuration : Nat) : Int {
    let thirtyDaysInNano = 30 * 24 * 60 * 60 * 1000 * 1000 * 1000;
    let durationInNano = planDuration * thirtyDaysInNano;
    joiningDate + durationInNano;
  };

  // Get all members
  public query ({ caller }) func getAllMembers() : async [Member] {
    // Check user permissions - member data is sensitive
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view members");
    };
    members.values().toArray().sort();
  };

  // Get member by ID
  public query ({ caller }) func getMember(id : Text) : async Member {
    // Check user permissions - member data is sensitive
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view members");
    };
    switch (members.get(id)) {
      case (null) { Runtime.trap("Member not found") };
      case (?member) { member };
    };
  };

  // Dashboard stats
  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    // Check admin permissions
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view dashboard stats");
    };
    let now = Nat64.fromIntWrap(Time.now());
    var activeMembers = 0;
    var expiredMembers = 0;
    var expiringSoon = 0;

    for (member in members.values()) {
      let expiry = Nat64.fromIntWrap(member.expiryDate);
      if (expiry < now) {
        expiredMembers += 1;
      } else if (expiry <= (now + (7 * 24 * 60 * 60 * 1000 * 1000 * 1000))) {
        // 7 days from now in nanoseconds
        expiringSoon += 1;
      } else {
        activeMembers += 1;
      };
    };

    {
      totalMembers = members.size();
      activeMembers;
      expiredMembers;
      expiringSoon;
    };
  };
};
