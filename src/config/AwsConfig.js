import sensitive from "../../sensitive.json";

export default (AwsConfig = {
  AccessKey: sensitive.ACCESS_KEY,
  SecretKey: sensitive.SECRET_KEY,
  Bucket: sensitive.BUCKET,
  keyPrefix: sensitive.keyPrefix,
  region: sensitive.region
});
