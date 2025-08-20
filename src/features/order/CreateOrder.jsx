import { Form, redirect, useActionData, useNavigation } from "react-router-dom";
import { createOrder } from "../../services/apiRestaurant";
import Button from "../../ui/Button";
import { useDispatch, useSelector } from "react-redux";
import { clearCart, getCart, getTotalCartPrice, getUsername } from "../cart/cartSlice";
import EmptyCart from "../cart/EmptyCart";
import store from "../../store";
import { formatCurrency } from "../../utilities/helpers";
import { useState } from "react";
import { fetchAddress } from "../user/userSlice";

// https://uibakery.io/regex-library/phone-number
const isValidPhone = (str) =>
  /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/.test(
    str
  );

function CreateOrder() {
  const [withPriority, setWithPriority] = useState(false);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const dispatch = useDispatch();
  const formErrors = useActionData();
  const cart = useSelector(getCart);
  const {username, status: addressStatus, position, address, error: errorAddress} = useSelector((state)=>state.user);
  const isLoadingAddress = addressStatus==="loading";
  const totalCartPrice = useSelector(getTotalCartPrice);
  const priorityPrice = withPriority ? totalCartPrice*0.2 : 0;
  const totalPrice = totalCartPrice+priorityPrice;

  if(!cart.length) return <EmptyCart/>;

  return (
    <div className="py-6 px-4">
      <h2 className="mb-8 font-semibold text-xl">Ready to order? Lets go!</h2>

      <Form method="POST">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">First Name</label>
          <input className="input grow" type="text" name="customer" defaultValue={username} required />
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sm:basis-40">Phone number</label>
          <div className="grow">
            <input className={`input w-full ${formErrors?.phone ? 'border-2 border-red-700':''}`} type="tel" name="phone" required />
          {formErrors?.phone&&<p className="text-red-700 text-semibold text-sm">{formErrors.phone}</p>}
          </div>
        </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center relative">
          <label className="sm:basis-40">Address</label>
          <div className="grow">
            <input className="input w-full" type="text" name="address" disabled={isLoadingAddress} defaultValue={address} required />
            {addressStatus==="error" && <p className="text-red-700 text-semibold text-sm">{errorAddress}</p>}
          </div>
{          !position.latitude&&!position.longitude && (<span className="absolute right-1 top-[37px] sm:top-[5px] md:top-[3px] z-10">
            <Button type="small" disabled={isLoadingAddress} onClick={(e)=>{
              e.preventDefault();
              dispatch(fetchAddress());
              }}>Get position</Button>
          </span>)}
        </div>

        <div className="flex flex-row">
          <input
          className="h-6 w-6 accent-yellow-400 focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2 mb-5 mr-5"
            type="checkbox"
            name="priority"
            id="priority"
            value={withPriority}
            onChange={(e) => setWithPriority(e.target.checked)}
          />
          <label htmlFor="priority">Want to yo give your order priority?</label>
        </div>

        <div>
          <input type="hidden" name="cart" value={JSON.stringify(cart)}/> 
          <input type="hidden" name="position" value={position.longitude && position.latitude ? `${position.latitude}, ${position.longitude}` : ''}/> 
          <Button type="primary" disabled={isSubmitting || isLoadingAddress}>{isSubmitting ? "Submitting..." : `Order now for ${formatCurrency(totalPrice)}`}</Button>
        </div>
      </Form>
    </div>
  );
}

export async function action({request}) {
  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  const order = {
    ...data,
    cart: JSON.parse(data.cart),
    priority: data.priority === "true",
  }

  console.log(data.priority);
  
  const errors = {};
  if(!isValidPhone(order.phone)) errors.phone = "Please give us your correct phone number!";
  if(Object.keys(errors).length>0) return errors;
  
  //If everything is ok, create new order and redirect
  const newOrder = await createOrder(order);

  store.dispatch(clearCart());

  return redirect(`/order/${newOrder.id}`);
}

export default CreateOrder;
