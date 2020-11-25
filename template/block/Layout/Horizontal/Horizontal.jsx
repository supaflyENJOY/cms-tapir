import './Horizontal.scss';

export default D.declare("block/Horizontal/Horizontal.jsx", function(input, children){
  input = inheritConfig(input);
  return <div class={'block-layout-horizontal'}>
    {children ? children : RenderBlocks(input.blocks)}
  </div>;
});