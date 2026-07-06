import { ProductsCrud } from "@/components/admin/products-crud";
import { getAdminCatalog } from "@/lib/data";

export default async function AdminProductsPage() {
  const { products, categories, brands, templates } = await getAdminCatalog();
  const fields = templates.flatMap((template) =>
    template.fields.map((field) => ({
      id: field.id,
      name: field.name,
      type: field.type,
      unit: field.unit,
      templateId: template.id,
      templateName: template.name,
      options: field.options.map((option) => ({ label: option.label, slug: option.slug })),
    })),
  );

  const serializedProducts = products.map((product) => ({
    ...product,
    price: product.price.toString(),
    oldPrice: product.oldPrice?.toString() ?? null,
    fieldValues: product.fieldValues.map((value) => ({
      fieldId: value.fieldId,
      field: value.field,
      option: value.option,
      valueText: value.valueText,
      valueNumber: value.valueNumber?.toString() ?? null,
      valueBoolean: value.valueBoolean,
      valueFileUrl: value.valueFileUrl,
      valueJson: value.valueJson,
    })),
  }));

  return (
    <ProductsCrud
      products={serializedProducts}
      categories={categories.map((category) => ({
        id: category.id,
        name: category.name,
        templateId: category.templateId,
        parent: category.parent,
      }))}
      brands={brands}
      templates={templates.map((template) => ({ id: template.id, name: template.name }))}
      fields={fields}
    />
  );
}
