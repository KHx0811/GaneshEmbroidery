import { Schema, model } from 'mongoose';

const productSchema = new Schema({
  product_name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['kids', 'simple', 'Boat Neck', 'Bride Desings'],
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  design_type: {
    type: String,
    required: true,
    enum: ['DST-BERNINA-14x8', 'DST-BROTHER-V3SE-12x8', 'DST-FULL', 'JEF-USHA-450-11x8', 'JEF-USHA-550-14x8', 'PES-BROTHER-BP3600-14x9.5'],
    trim: true
  },
  image: {
    type: String,
    required: true,
    trim: true
  },
  cloudinary_image_id: {
    type: String,
    trim: true
  },
  design_files: {
    DST_BERNINA_14x8: {
      file_url: { type: Schema.Types.Mixed, default: null },
      google_drive_id: { type: Schema.Types.Mixed, default: null },
      file_name: { type: Schema.Types.Mixed, default: null },
      price: { type: Number, default: 0 }
    },
    DST_BROTHER_V3SE_12x8: {
      file_url: { type: Schema.Types.Mixed, default: null },
      google_drive_id: { type: Schema.Types.Mixed, default: null },
      file_name: { type: Schema.Types.Mixed, default: null },
      price: { type: Number, default: 0 }
    },
    DST_FULL: {
      file_url: { type: Schema.Types.Mixed, default: null },
      google_drive_id: { type: Schema.Types.Mixed, default: null },
      file_name: { type: Schema.Types.Mixed, default: null },
      price: { type: Number, default: 0 }
    },
    JEF_USHA_450_11x8: {
      file_url: { type: Schema.Types.Mixed, default: null },
      google_drive_id: { type: Schema.Types.Mixed, default: null },
      file_name: { type: Schema.Types.Mixed, default: null },
      price: { type: Number, default: 0 }
    },
    JEF_USHA_550_14x8: {
      file_url: { type: Schema.Types.Mixed, default: null },
      google_drive_id: { type: Schema.Types.Mixed, default: null },
      file_name: { type: Schema.Types.Mixed, default: null },
      price: { type: Number, default: 0 }
    },
    PES_BROTHER_BP3600_14x9_5: {
      file_url: { type: Schema.Types.Mixed, default: null },
      google_drive_id: { type: Schema.Types.Mixed, default: null },
      file_name: { type: Schema.Types.Mixed, default: null },
      price: { type: Number, default: 0 }
    }
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

productSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

const Product = model('Product', productSchema);
export default Product;