
export default function main(input){
  return <>
    <div>Hello world!{input.pageName}</div>

    {this.RenderBlocks(input.blocks)}
    <h3>H3</h3>

    <button onClick={()=>input.val.set(input.val.get()+1)}>b1</button>
    <div style={{textAlign: _=>input.val.sub(val=>
      {console.log(val);_(val%2?'left':'center')}
      )}}>VAL: {input.val}</div>
  </>
};