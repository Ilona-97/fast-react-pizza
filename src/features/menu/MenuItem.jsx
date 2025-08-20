import { useDispatch, useSelector } from "react-redux";
import Button from "../../ui/Button";
import { formatCurrency } from "../../utilities/helpers";
import { addItem, getCurrentQuantity } from "../cart/cartSlice";
import DeleteItem from "../cart/DeleteItem";
import UpdateItemQuantity from "../cart/UpdateItemQuantity";

function MenuItem({ pizza }) {
  const { id, name, unitPrice, ingredients, soldOut, imageUrl } = pizza;
  const dispatch = useDispatch();
  const currentQuantity = useSelector(getCurrentQuantity(id));
  const isInCart = currentQuantity>0;

  function handleAddItem(e) {
    e.preventDefault();
    const newItem = {
            pizzaId: id,
            name,
            quantity: 1,
            unitPrice,
            totalPrice: 1*unitPrice
        }
    dispatch(addItem(newItem));
  }

  return (
    <li className="flex gap-4 py-2">
      <img src={imageUrl} alt={name} className={`h-24 ${soldOut ? 'opacity-70 grayscale' : ''}`}/>
      <div className="flex flex-col grow pt-0.5">
        <p className="font-medium">{name}</p>
        <p className="capitalize text-stone-500 italic text-sm">{ingredients.join(', ')}</p>
        <div className="mt-auto flex justify-between items-center">
          {!soldOut ? <p className="text-sm">{formatCurrency(unitPrice)}</p> : <p className="text-sm text-stone-500 uppercase font-medium">Sold out</p>}
          {isInCart && 
            <div className="flex gap-3 items-center sm:gap-8">
              <UpdateItemQuantity pizzaId={id} currentQuantity={currentQuantity}/>
              <DeleteItem pizzaId={id}/>
            </div>}
          {!soldOut && !isInCart && <Button type="small" onClick={handleAddItem}>Add to cart</Button>}
        </div>
      </div>
    </li>
  );
}

export default MenuItem;
