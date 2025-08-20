import { formatCurrency } from "../../utilities/helpers";

function OrderItem({ item, isLoadingIngredients, ingredients }) {
  const { quantity, name, totalPrice } = item;



  return (
    <li className="py-2">
      <div className="flex flex-row gap-5 justify-between">
        <p className="font-bold">
          <span>{quantity}&times;</span> {name}
        </p>
        <p className="italic text-xs flex items-center capitalize">{isLoadingIngredients ? "Loading ingredients..." : ingredients.join(", ")}</p>
        <p>{formatCurrency(totalPrice)}</p>
      </div>
    </li>
  );
}

export default OrderItem;
