function ProductForm() {
  return (
    <form>
      <div>
        <label htmlFor="sku">SKU</label>
        <input id="sku" type="text" />
      </div>

      <div>
        <label htmlFor="title">Title</label>
        <input id="title" type="text" />
      </div>

      <div>
        <label htmlFor="title">Title</label>
        <input id="title" type="text" />
      </div>

      <div>
        <label htmlFor="variants">Variants</label>
        <input id="variants" type="text" />
      </div>

      <div>
        <label htmlFor="status">Status</label>
        <select id="status">
          <option value="">Select status</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div>
        <button type="button">Cancel</button>
        <button type="submit">Save</button>
      </div>
    </form>
  );
}

export default ProductForm;
