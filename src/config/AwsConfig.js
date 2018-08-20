import * as sensitive from "../../sensitive.json";

export default (AwsConfig = {
  accessKey: sensitive.ACCESS_KEY,
  secretKey: sensitive.SECRET_KEY,
  bucket: sensitive.BUCKET,
  keyPrefix: sensitive.keyPrefix,
  region: sensitive.region
});
