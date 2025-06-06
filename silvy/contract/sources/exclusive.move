module sweety::exclusive;

use sui::coin::{Coin};
use sui::sui::SUI;
use sui::event;

use std::string::String;
use sui::dynamic_field;
use sui::table;

use sweety::utils::is_prefix;

// Album-related errors: 100–199
const E_INVALID_CAP: u64 = 100;
const E_NOT_EQUAL: u64 = 101;
const E_DUPLICATE: u64 = 102;
const E_INVALID_FEE_RANGE: u64 = 103;

// Vault-related errors: 200–299
const E_NO_ACCESS: u64 = 200;
const E_INSUFFICIENT_BALANCE: u64 = 201;

const MARKER: u64 = 3;

public struct Album has key {
    id: UID,
    name: String,
    price: u64,
    owner: address,
    insider: vector<address>,
    max_insider: u64,
}

public struct AlbumCap has key {
    id: UID,
    album_id: ID,
}

public struct AdminCap has key {
    id: UID,
}

public struct Vault has key, store {
    id: UID,
    admin: address,
    admin_cap_id: ID,
    balances: table::Table<address, u64>,
}

public struct SupportEvent has copy, drop {
    supporter: address,
    album_id: ID,
    creator: address,
    total_payment: u64,
    creator_fee: u64,
    platform_fee: u64,
}

public struct CreatorTipEvent has copy, drop {
    supporter: address,
    creator: address,
    total_payment: u64,
    creator_fee: u64,
    platform_fee: u64,
}

// Sui give me funding please, I'm working so hard for 2 month for this from zero - hero in sui ecosystem and i love it 😋.
// Thanks for Road to overflow thailand for the opportunity !!!
// Don't forget to give me the prices, this will go for my University Scholarship at Kasetsart University.
// Also looking for an opportunity to make silvy go to the market :)

// vault initilizer 
public struct EXCLUSIVE has drop {}

fun init(witness: EXCLUSIVE, ctx: &mut TxContext) {
    let (vault, admin_cap) = create_admin_vault(witness, ctx);
    transfer::share_object(vault);
    transfer::transfer(admin_cap, ctx.sender());
}

fun create_admin_cap(ctx: &mut TxContext): AdminCap {
    AdminCap {
        id: object::new(ctx),
    }
}

fun create_admin_vault(_witness: EXCLUSIVE, ctx: &mut TxContext): (Vault, AdminCap) {
    let admin_address = ctx.sender();
    let admin_cap = create_admin_cap(ctx);
    let admin_cap_id = object::id(&admin_cap);

    let balance = table::new<address, u64>(ctx);
    let vault = Vault {
        id: object::new(ctx),
        admin: admin_address,
        admin_cap_id,
        balances: balance,
    };

    (vault, admin_cap)
}

// === Album Creation ===
// create album and transfer admin cap to creator
public fun create_album(
    name: String,
    price: u64,
    creator: address,
    max_insider: u64,
    ctx: &mut TxContext
): AlbumCap {
    let mut album = Album {
        id: object::new(ctx),
        name,
        price,
        owner: creator,
        insider: vector::empty(),
        max_insider: max_insider+1  // +1 for creator,
    };
    let album_cap = AlbumCap {
        id: object::new(ctx),
        album_id: object::id(&album),
    };
    album.insider.push_back(creator);
    transfer::share_object(album);
    album_cap
}

entry fun create_album_entry(
    name: String,
    price: u64,
    creator: address,
    max_insider: u64,
    ctx: &mut TxContext
) {
    transfer::transfer(create_album(name, price, creator, max_insider, ctx), creator);
}

// === Album Support ===
entry fun support_album(
    album: &mut Album,
    mut payment: Coin<SUI>,
    fee: u64,
    _vault: &mut Vault,
    ctx: &mut TxContext
) {
    let sender = ctx.sender();
    assert!(!album.insider.contains(&sender), E_DUPLICATE);
    assert!(payment.value() == album.price, E_NOT_EQUAL);
    assert!(fee >= 1 && fee <= 20, E_INVALID_FEE_RANGE);
    assert!(album.insider.length() <= album.max_insider - 1, E_NO_ACCESS);
    let total_payment = album.price;
    let platform_fee = (total_payment * fee).divide_and_round_up(100);
    let creator_fee = total_payment - platform_fee;

    assert!(platform_fee+creator_fee == payment.value(),E_INSUFFICIENT_BALANCE);
    let platform_coin = payment.split(platform_fee, ctx);
    let creator_coin = payment.split(creator_fee, ctx);

    transfer::public_transfer(platform_coin, _vault.admin);
    transfer::public_transfer(creator_coin, album.owner);

    // update_creator_balance(album.owner, _vault, creator_fee, ctx);
    album.insider.push_back(sender);
    event::emit(SupportEvent {
        supporter: sender,
        album_id: object::id(album),
        creator: album.owner,
        total_payment: total_payment,
        creator_fee,
        platform_fee,
    });
    payment.destroy_zero();
}

entry fun tip_to_creator(
    creator: address,
    mut payment: Coin<SUI>,
    fee: u64,
    _vault: &mut Vault,
    ctx: &mut TxContext
){
    let total_payment = payment.value();
    let platform_fee = (total_payment * fee).divide_and_round_up(100);
    let creator_fee = total_payment - platform_fee;

    assert!(platform_fee+creator_fee == payment.value(),E_INSUFFICIENT_BALANCE);
    let platform_coin = payment.split(platform_fee, ctx);
    let creator_coin = payment.split(creator_fee, ctx);

    transfer::public_transfer(platform_coin, _vault.admin);
    transfer::public_transfer(creator_coin, creator);

    // update_creator_balance(creator, _vault, creator_fee, ctx);
    
    event::emit(CreatorTipEvent {
        supporter: ctx.sender(),
        creator: creator,
        total_payment: total_payment,
        creator_fee,
        platform_fee,
    });
    payment.destroy_zero();
}

public fun creator_add(album: &mut Album, album_cap: &AlbumCap, account: address) {
    assert!(album_cap.album_id == object::id(album), E_INVALID_CAP);
    assert!(!album.insider.contains(&account), E_DUPLICATE);
    album.insider.push_back(account);
}

public fun creator_remove(album: &mut Album, album_cap: &AlbumCap, account: address) {
    assert!(album_cap.album_id == object::id(album), E_INVALID_CAP);
    album.insider = album.insider.filter!(|x| x != account);
}

public fun namespace(album: &Album): vector<u8> {
    album.id.to_bytes()
}

fun approve_internal(caller: address, id: vector<u8>, album: &Album): bool {
    let ns = namespace(album);
    if (!is_prefix(ns, id)) return false;
    album.insider.contains(&caller)
}

entry fun seal_approve(id: vector<u8>, album: &Album, ctx: &TxContext) {
    assert!(approve_internal(ctx.sender(), id, album), E_NO_ACCESS);
}

entry fun publish(album: &mut Album, album_cap: &AlbumCap, blobId: String) {
    assert!(album_cap.album_id == object::id(album), E_INVALID_CAP);
    assert!(!dynamic_field::exists_(&album.id, blobId), E_DUPLICATE);
    dynamic_field::add(&mut album.id, blobId, MARKER);
}


// fun update_creator_balance(
//     creator: address,
//     album_id: ID,
//     vault: &mut Vault,
//     amount: u64,
//     ctx: &mut TxContext
// ) {
//     if (!table::contains(&vault.balances, creator)) {
//         let creator_bag = table::new<ID, u64>(ctx);
//         table::add(&mut vault.balances, creator, creator_bag);
//     };
//     let creator_bag = table::borrow_mut(&mut vault.balances, creator);

//     let prev_balance = if (table::contains(creator_bag, album_id)) {
//         *table::borrow(creator_bag, album_id)
//     } else {
//         0
//     };
//     table::add(creator_bag, album_id, prev_balance + amount);
// }

// fun update_admin_balance(vault: &mut Vault, amount: u64) {
//     let admin_address = vault.admin;
//     let admin_cap_id = vault.admin_cap_id;

//     let admin_bag = table::borrow_mut(&mut vault.balances, admin_address);
//     let prev_balance = if (table::contains(admin_bag, admin_cap_id)) {
//         *table::borrow(admin_bag, admin_cap_id)
//     } else {
//         0
//     };
//     table::add(admin_bag, admin_cap_id, prev_balance + amount);
// }

// fun update_balance(
//     album: &Album,
//     platform_fee: u64,
//     creator_fee: u64,
//     fee: u64,
//     vault: &mut Vault,
//     ctx: &mut TxContext
// ) {
//     let creator = album.owner;
//     let album_id = object::id(album);
//     update_creator_balance(creator, album_id, vault, creator_fee, ctx);
//     update_admin_balance(vault, platform_fee, fee);
// }

// entry fun withdraw_platform_balances(
//     _admin_cap: &AdminCap,
//     vault: &mut Vault,
//     request_amount: u64,
//     ctx: &mut TxContext
// ) {
//     let admin = ctx.sender();
//     assert!(admin == vault.admin, E_NO_ACCESS);

//     let admin_cap_id = object::id(_admin_cap);
//     let admin_bag = table::borrow_mut(&mut vault.balances, admin);
//     let current_balance = table::borrow(admin_bag, admin_cap_id);

//     assert!(*current_balance >= request_amount, E_INSUFFICIENT_BALANCE);
//     table::add(admin_bag, admin_cap_id, *current_balance - request_amount);

//     let coin = balance::split<SUI>(&mut vault.platform_balance, request_amount).into_coin(ctx);
//     transfer::public_transfer(coin, admin);
// }

// entry fun withdraw_creator_balances(
//     album_cap: &AlbumCap,
//     vault: &mut Vault,
//     request_amount: u64,
//     ctx: &mut TxContext
// ) {
//     let creator = ctx.sender();
//     let album_id = album_cap.album_id;

//     assert!(table::contains(&vault.balances, creator), E_MISSING_CREATOR_BAG);
//     let creator_bag = table::borrow_mut(&mut vault.balances, creator);
//     assert!(table::contains(creator_bag, album_cap.album_id), E_MISSING_CREATOR_BAG);
//     let creator_balance = table::borrow(creator_bag, album_id);

//     assert!(*creator_balance >= request_amount, E_INSUFFICIENT_BALANCE);
//     table::add(creator_bag, album_id, *creator_balance - request_amount);

//     let coin = balance::split<SUI>(&mut vault.platform_balance, request_amount).into_coin(ctx);
//     transfer::public_transfer(coin, creator);
// }