// Copyright (c), Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

module sweety::albums;

use sui::coin::{Self, Coin};
use sui::sui::{SUI};
use sui::balance::{Self, Balance};
use sui::dynamic_field ;

use sui::table;
use std::string::{String};

use sweety::utils::is_prefix;

const EInvalidCap: u64 = 0;
const ENoAccess: u64 = 1;
const EDuplicate: u64 = 2;
const ENotEqual: u64 = 0;
const MARKER: u64 = 3;

public struct Album has key {
    id: UID,
    name: String,
    price: u64,
    owner: address,
    insider: vector<address>,
}
 
public struct Cap has key {
    id: UID,
    album_id: ID,
}

public struct Vault has key, store {
    id: UID,
    admin: address,
    platform_balance: Balance<SUI>,
    balances: table::Table<address,u64>,
}

/// ---- initilizer --- 
public struct ALBUMS has drop {}

fun init(witness: ALBUMS, ctx: &mut TxContext) {
    transfer::public_transfer(
    create_admin_vault(witness, ctx),
    ctx.sender()  
    )
}

fun create_admin_vault(_witness: ALBUMS, ctx: &mut TxContext): Vault {
    let adminVault = Vault {
        id: object::new(ctx),
        admin: ctx.sender(),
        platform_balance: balance::zero(),
        balances: table::new<address,u64>(ctx),
    };
    adminVault
}

public fun create_album(name: String, price: u64, creator: address, ctx: &mut TxContext): Cap {
    let mut album = Album {
        id: object::new(ctx),
        name: name,
        owner: creator,
        price: price,
        insider: vector::empty(),
    };
    album.insider.push_back(creator);
    let cap = Cap {
        id: object::new(ctx),
        album_id: object::id(&album),
    };
    transfer::share_object(album);
    cap
}

// creator creator album and transfer admin cap to creator
entry fun create_album_entry(name: String, price: u64, creator: address ,ctx: &mut TxContext) {
    transfer::transfer(create_album(name, price, creator,     ctx), creator);
}

fun update_balance(album: &Album, payment: Coin<SUI> , fee: u64, vault: &mut Vault) {
    // fee = 0.2 => 20 / 100
    let total_payment = album.price;
    let platform_fee = (total_payment * fee).divide_and_round_up(100) ;
    let creator_fee = total_payment - platform_fee;

    let old_creator_balance = if (table::contains(&vault.balances, album.owner)) {
        *table::borrow(&vault.balances, album.owner)
    } else {
        0
    };
    table::add(&mut vault.balances, album.owner, old_creator_balance + creator_fee);

    let old_admin_balance = if (table::contains(&vault.balances, vault.admin)) {
        *table::borrow(&vault.balances, vault.admin)
    } else {
        0
    };
    table::add(&mut vault.balances, vault.admin, old_admin_balance + platform_fee);
    vault.platform_balance.join( coin::into_balance(payment));
}

// subscriber add by themself knowing exact price to pay and which creator they have to pay 
entry fun support_album(album: &mut Album, payment: Coin<SUI> , fee: u64, vault: &mut Vault, ctx: &TxContext){
    let sender = ctx.sender();
    assert!(!album.insider.contains(&sender), EDuplicate);   
    assert!( payment.value() == album.price, ENotEqual);
    assert!(fee > 20 || fee <= 0, 0);

    update_balance(album, payment, fee, vault);
    album.insider.push_back(sender);
}

entry fun withdraw_request(vault: &mut Vault, request_amount: u64,ctx: &mut TxContext) {
let creator = ctx.sender();
    let user_balance = table::borrow(&vault.balances, creator);
    assert!(*user_balance >= request_amount, ENoAccess);
    assert!(*user_balance != 0, ENoAccess);
    table::add(&mut vault.balances, creator, *user_balance - request_amount);

    // split from platform_balance
    let reward_coin = balance::split<SUI>(&mut vault.platform_balance, request_amount).into_coin(ctx);
    transfer::public_transfer(reward_coin, creator);    
}

// bypass accessable by creator
//creator manually add buyer offer or request to buy 
public fun request_add(album: &mut Album, cap: &Cap, account: address) {
    assert!(cap.album_id == object::id(album), EInvalidCap);
    assert!(!album.insider.contains(&account), EDuplicate);   
    album.insider.push_back(account);
}

// vault.balances.insert(album.owner, album.price);
public fun remove(album: &mut Album, cap: &Cap, account: address) {
    assert!(cap.album_id == object::id(album), EInvalidCap);
    album.insider = album.insider.filter!(|x| x != account);
}

//////////////////////////////////////////////////////////
/// Access control
/// key format: [pkg id]::[allowlist id][random nonce]
/// (Alternative key format: [pkg id]::[creator address][random nonce] - see private_data.move)
public fun namespace(album: &Album): vector<u8> {
    album.id.to_bytes()
}

/// All allowlisted addresses can access all IDs with the prefix of the allowlist
fun approve_internal(caller: address, id: vector<u8>, album: &Album): bool {
    // Check if the id has the right prefix
    let namespace = namespace(album);
    if (!is_prefix(namespace, id)) {
        return false
    };

    // Check if user is in the allowlist
    album.insider.contains(&caller)
}

entry fun seal_approve(id: vector<u8>, album: &Album, ctx: &TxContext) {
    assert!(approve_internal(ctx.sender(), id, album), ENoAccess);
}

/// Encapsulate a blob into a Sui object and attach it to the allowlist
entry public fun publish(album: &mut Album, cap: &Cap, blob_id: String) {
    assert!(cap.album_id == object::id(album), EInvalidCap);
    dynamic_field::add(&mut album.id, blob_id, MARKER);
}

