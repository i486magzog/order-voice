'use server'

import { Redis } from "@upstash/redis";
import { revalidateTag } from 'next/cache';
import { unstable_cache } from 'next/dist/server/web/spec-extension/unstable-cache';
import { Order, Orders, OrderStatus } from "@/shared/types/global";

const redis = Redis.fromEnv();

export async function getPendingOrders() {
  return getAllCachedOrders()
    .then((orders:Orders | null) => {
      if (!orders?.pending) return { }
      return orders.pending
    })
}
export async function getInProgressOrders() {
  return getAllCachedOrders()
    .then((orders:Orders | null) => {
      if (!orders?.inProgress) return { }
      return orders.inProgress
    })
}
export async function getReadyToServeOrders() {
  return getAllCachedOrders()
    .then((orders:Orders | null) => {
      if (!orders?.readyToServe) return { }
      return orders.readyToServe
    })
}
export const getAllOrders = async () => getAllCachedOrders();
export const removeAllOrders = async () => {
  return redis.json.del(`orders`)
    .then(() => renewAllCachedOrders())
    .catch(() => {
      throw new Error('Failed to clear all orders');
    })
}
export const changeOrderStatus = async (orderNum:number, from:OrderStatus, to:OrderStatus) => {
  return removeOrder(orderNum, from)
    .then(() =>{
      if(to === OrderStatus.CANCELLED || to === OrderStatus.COMPLETED) return;
      return addOrUpdateOrder(orderNum, to)
    })
    .then(() => renewAllCachedOrders())
    .then(() => getAllCachedOrders())
    .catch(() => {
      throw new Error('Failed to change order status');
    })
}
export const placeOrder = async (menus?:string[]) => {
  return redis.incr(`orderNum`)
    .then((orderNum) => addOrUpdateOrder(orderNum, OrderStatus.PENDING, menus))
    .then(() => renewAllCachedOrders())
    .then(() => getAllCachedOrders())
    .catch((e:Error) => {
      // If there is no orders object, create it.
      if(e.message.includes('new objects must be created at the root')){
        const ordersInitJson = { pending: { }, inProgress: { }, readyToServe: { } } as Orders;
        return redis.json.set(`orders`, `$`, ordersInitJson )
          .then(() => renewAllCachedOrders())
          .then(() => getAllCachedOrders())
      }
      else {
        console.error(e.message);
        throw new Error('Failed to place order');
      }
    })
}

const addOrUpdateOrder = async (orderNum:number, status:OrderStatus, menus?:string[]) => redis.json.set(`orders`, `$.${status}["${orderNum}"]`, { orderNum, createdAt: new Date().toISOString(), menus: menus ?? []} as Order)
const removeOrder = async (orderNum:number, status:OrderStatus) => redis.json.del(`orders`, `$.${status}["${orderNum}"]`);
const getAllOrdersFromDB = async (): Promise<Orders | null> => redis.json.get<Orders>(`orders`);
const getAllCachedOrders = unstable_cache(
  async () => {
    return getAllOrdersFromDB()
  },
  ['all-orders'],
  { tags: ['all-orders'] }
)
const renewAllCachedOrders = async () => revalidateTag('all-orders');