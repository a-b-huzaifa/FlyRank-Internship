const { z } = require('zod');

const bookRecordSchema = z.object({
  title: z.string().min(1, "Title must not be empty"),
  product_url: z.string().url("Invalid product URL"),
  price_text: z.string().min(1, "Price text must not be empty"),
  price_gbp: z.number().nonnegative("Price must be non-negative"),
  availability_text: z.string().min(1, "Availability text must not be empty"),
  rating_text: z.string().min(1, "Rating text must not be empty"),
  description: z.string().nullable(),
  source_page: z.string().url("Invalid source page URL"),
  fetched_at: z.string().datetime({ message: "Invalid ISO 8601 timestamp" })
});

function validateBookRecord(record) {
  const result = bookRecordSchema.safeParse(record);
  if (!result.success) {
    return {
      success: false,
      errors: result.error.issues.map(issue => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    };
  }
  return {
    success: true,
    data: result.data
  };
}

module.exports = {
  bookRecordSchema,
  validateBookRecord
};
