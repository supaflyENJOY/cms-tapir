import './Horizontal.scss';

export default D.declare("block/Horizontal/Horizontal.jsx", {
  ctor: function(input, children){
    input = inheritConfig(input);
    this.dom = <div class={'block-layout-horizontal'}>
      {children ? children : RenderBlocks(input.blocks, ()=>this.afterUpdate())}
    </div>;
  },
  afterUpdate: function() {
    setTimeout(()=>{
      D._recursiveCmpCall( this.dom, {childNodes: this.dom.childNodes}, 'afterLayoutUpdate' )
    }, 0);
  },
  afterAddToDOM: function() {
    console.log(1);
  }
});