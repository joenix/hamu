// 
(() => {})(
  // As Global
  window
);

// Instance of COS
var cos = new COS({
  SecretId: 'AKIDDM1fbSNLF99CGSi9dHziNyU5fEl9MLUd',
  SecretKey: 'Ng4gM3iIvW2QpxDbzaDkEwppyJnP5z36'
});

console.log(777);
// For Upload File
export function upload(selector) {
  console.log(10);
  // Get Dom
  const { files } = document.querySelector(selector);

  // Get File
  var file = files[0];

  // No File
  if (!file) {
    return console.log('[Upload] no file choose ...');
  }

  //
  cos.putObject(
    {
      Bucket: 'hamu-1323048840' /* 存储桶名称，格式：BucketName-APPID */,
      Region: 'ap-shanghai' /* 存储桶地域 */,
      Key: file.name /* 文件名 */,
      Body: file /* 文件对象 */
    },
    function (err, data) {
      if (err) {
        console.error('上传失败', err);
      } else {
        console.log('上传成功', data);
      }
    }
  );
}

// Binding
window.upload = upload;
