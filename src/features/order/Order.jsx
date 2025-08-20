// Test ID: IIDSAT

import { useFetcher, useLoaderData } from "react-router-dom";
import { getOrder } from "../../services/apiRestaurant";
import {
  calcMinutesLeft,
  formatCurrency,
  formatDate,
} from "../../utilities/helpers";
import OrderItem from "./OrderItem";
import { useEffect } from "react";
import UpdateOrder from "./UpdateOrder";

function Order() {
  // Everyone can search for all orders, so for privacy reasons we're gonna gonna exclude names or address, these are only for the restaurant staff
const order = useLoaderData();

const fetcher = useFetcher();

useEffect(
  function() {
    if(!fetcher.data && fetcher.state==="idle") fetcher.load("/menu");
  }, [fetcher]
);

  const {
    id,
    status,
    priority,
    priorityPrice,
    orderPrice,
    estimatedDelivery,
    cart,
  } = order;
  const deliveryIn = calcMinutesLeft(estimatedDelivery);

  return (
    <div className="px-4 py-6 space-y-8">
      <div className="flex flex-wrap justify-between items-cente gap-2">
        <h2 className="text-xl font-semibold underline">Order #{id} status:</h2>

        <div className="space-x-2">
          {priority && <span className="font-semibold bg-red-500 text-yellow-50 rounded-md px-2 py-2 uppercase tracking-wide">Priority</span>}
          <span className={`font-semibold bg-yellow-400 text-yellow-50 rounded-md px-2 py-2 uppercase tracking-wide ${status==="delivered" ? 'bg-green-500' : ''}`}>{status} order</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2 bg-stone-200 px-3 py-3 rounded-md">
        <p>
          {deliveryIn >= 0
            ? `Only ${calcMinutesLeft(estimatedDelivery)} minutes left 😃`
            : "Order should have arrived:"}
        </p>
        <p className="text-sm">(Estimated delivery: {formatDate(estimatedDelivery)})</p>
      </div>

      <ul className="py-3 px-3 divide-y divide-stone-200">
        {cart.map(item=><OrderItem item={item} key={item.pizzaId} ingredients={fetcher?.data?.find(el=>el.id===item.pizzaId)?.ingredients ?? []} isLoadingIngredients={fetcher.state==="loading"}/>)}
      </ul>

      <div className="space-y-1 bg-stone-200 px-3 py-3 rounded-md">
        <p className="text-right tracking-wide">Price pizza: {formatCurrency(orderPrice)}</p>
        {priority && <p className="text-right tracking-wide">Price priority: {formatCurrency(priorityPrice)}</p>}
        <p className="text-right overline text-xl font-bold py-2">To pay on delivery: {formatCurrency(orderPrice + priorityPrice)}</p>
      </div>
      {!priority && <UpdateOrder order={order}/>}
    </div>
  );
}

export async function loader({params}) {
  const order = await getOrder(params.orderId);
  return order;
}

export default Order;
