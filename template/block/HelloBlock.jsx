import { Slider } from "component/Slider/Slider.jsx";

export default function HelloBlock(input){
  input = inheritConfig(input);

  this.dom = <div style={{ border: '3px solid #ccc', padding: '20px' }}>
    <b>This is a block with a 'text' property <mark>{input.text}</mark></b>
    <div>This block also takes 'anotherText' property <mark>{input.anotherText}</mark></div>
    <button onClick={() => input.anotherText.set( 'hmm' )}>hmm</button>
    <button onClick={() => input.anotherText.set( 'hmm hmm' )}>hmm hmm</button>

    <Slider from={10} to={100} step={1} value={input.val || 250}/>
    {input.val}
    <b>hello! world!!</b>
  </div>;
}