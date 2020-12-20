import Horizontal from "block/Layout/Horizontal/Horizontal.jsx";
import { Checkbox } from "component/Checkbox/Checkbox.jsx";
import Vertical from "block/Layout/Vertical/Vertical.jsx";
import { Slider } from "component/Slider/Slider.jsx";
import { Tree } from "component/Tree/Tree.jsx";
export default function main(input){
  return <Horizontal resizable>
    <Tree tree={[{name: 'os'}, {name: 'lal', items: [{name: 'ss'}]}]}></Tree>

  </Horizontal>
};