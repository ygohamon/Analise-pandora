
export const DBTypes = {
  VarChar (length) {
    return { type: DBTypes.VarChar, length }
  },
  NVarChar (length) {
    return { type: DBTypes.NVarChar, length }
  },
  Text () {
    return { type: DBTypes.Text }
  },
  Int () {
    return { type: DBTypes.Int }
  },
  BigInt () {
    return { type: DBTypes.BigInt }
  },
  TinyInt () {
    return { type: DBTypes.TinyInt }
  },
  SmallInt () {
    return { type: DBTypes.SmallInt }
  },
  Bit () {
    return { type: DBTypes.Bit }
  },
  Float () {
    return { type: DBTypes.Float }
  },
  Numeric (precision, scale) {
    return { type: DBTypes.Numeric, precision, scale }
  },
  Decimal (precision, scale) {
    return { type: DBTypes.Decimal, precision, scale }
  },
  Real () {
    return { type: DBTypes.Real }
  },
  Date () {
    return { type: DBTypes.Date }
  },
  DateTime () {
    return { type: DBTypes.DateTime }
  },
  DateTime2 (scale) {
    return { type: DBTypes.DateTime2, scale }
  },
  DateTimeOffset (scale) {
    return { type: DBTypes.DateTimeOffset, scale }
  },
  SmallDateTime () {
    return { type: DBTypes.SmallDateTime }
  },
  Time (scale) {
    return { type: DBTypes.Time, scale }
  },
  UniqueIdentifier () {
    return { type: DBTypes.UniqueIdentifier }
  },
  SmallMoney () {
    return { type: DBTypes.SmallMoney }
  },
  Money () {
    return { type: DBTypes.Money }
  },
  Binary (length) {
    return { type: DBTypes.Binary, length }
  },
  VarBinary (length) {
    return { type: DBTypes.VarBinary, length }
  },
  Image () {
    return { type: DBTypes.Image }
  },
  Xml () {
    return { type: DBTypes.Xml }
  },
  Char (length) {
    return { type: DBTypes.Char, length }
  },
  NChar (length) {
    return { type: DBTypes.NChar, length }
  },
  NText () {
    return { type: DBTypes.NText }
  },
  TVP (tvpType) {
    return { type: DBTypes.TVP, tvpType }
  },
  UDT () {
    return { type: DBTypes.UDT }
  },
  Geography () {
    return { type: DBTypes.Geography }
  },
  Geometry () {
    return { type: DBTypes.Geometry }
  },
  Variant () {
    return { type: DBTypes.Variant }
  }
}
