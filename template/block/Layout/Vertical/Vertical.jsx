import './Vertical.scss';

export default D.declare("block/Vertical/Vertical.jsx", function(input, children){
  input = inheritConfig(input);
  return <div class={'block-layout-vertical'}>
    {children ? children : this.drawBlock(input.blocks)}
  </div>;
});