import Horizontal from "block/Layout/Horizontal/Horizontal.jsx";
import { Checkbox } from "component/Checkbox/Checkbox.jsx";
import Vertical from "block/Layout/Vertical/Vertical.jsx";
import { Slider } from "component/Slider/Slider.jsx";
export default function main(input){
  var val1 = new Store.Value.Boolean(false);
  return <Horizontal>
      <b>1</b>
      <b>2</b>
    <Vertical>
      <Checkbox value={true}/>
      <Checkbox value={val1}/>
      <Checkbox value={true}/>
      <Checkbox value={val1}/>
      <Slider from={10} to={100} value={33}/>
    </Vertical>
      <b>4</b>
      <b>5</b>
    </Horizontal>


};