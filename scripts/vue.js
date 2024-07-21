/**
 * Vue for Page
 * ======== ======== ========
 */
new Vue({
  el: '#app',
  data: {
    preloader: true,
    disable: false,
    file: null,
    list: [],
    batch: [],
    mode: false,

    appid: `wx5d458ff8b11233f0`,
    redirect: encodeURIComponent(`https://wechat.hamuai.net/callback`),
    state: `hamuai`,

    qrImage: null
  },
  computed: {
    batching() {
      return this.batch.filter((value) => value !== false);
    }
  },
  methods: {
    // 工程初始化函数
    init() {
      // 移除 Preload 蒙版
      this.preloader = false;

      // 获取二维码
      this.createQR();

      // 重置状态
      this.reset();
    },

    // 格式化时间
    format(time) {
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC'
      };

      // 转换为数组并重新排序
      const [day, month, year, hour, minute, second] = new Intl.DateTimeFormat('en-GB', options).format(new Date(time)).replace(',', '').replace(/\//g, '-').match(/\d+/g);

      // 组装时间
      return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
    },

    // 选择视频
    choose(e, index) {
      this.$set(this.batch, index, !!e.target.checked);
    },

    //

    // 单个下载
    async download(file, callback) {
      cos.getObject(
        this.coset({
          Bucket: 'hamu-1323048840',
          Region: 'ap-shanghai',
          Key: file.Key,
          onProgress(progress) {
            // Blob
            const blob = new Blob([progress], { type: 'application/octet-stream' });

            // Url
            const url = URL.createObjectURL(blob);

            // 下载链接
            const a = document.createElement('a');
            a.href = url;
            a.download = file.Key;
            a.style.display = 'none';

            document.body.appendChild(a);
            a.click();

            // 清理
            document.body.removeChild(a);
            URL.revokeObjectURL(url); // 释放对象 URL

            // 回调
            callback();
          }
        }),
        (err, data) => {
          console.log(err || data.Body);
        }
      );
    },

    // 批量下载
    async batchdownload(e, count = 0) {
      if (count >= this.list.length) {
        return;
      }

      const file = this.batch[count] ? this.list[count] : null;

      if (!file) {
        return this.batchdownload(e, ++count);
      }

      const that = this;

      await this.download(file, () => {
        document.querySelector('#choose_' + count).checked = false;
        e.target.checked = false;
        this.choose(e, count);

        var out = setTimeout(() => {
          that.batchdownload(e, ++count);
          clearTimeout(out);
        }, 150);
      });
    },

    // 归集 COS 配置
    coset(opts = {}) {
      return {
        // 存储桶名称，格式：BucketName-APPID
        Bucket: 'hamu-1323048840',
        // 存储桶地域
        Region: 'ap-shanghai',
        // 其他参数
        ...opts
      };
    },

    // 选文件
    choosen(e) {
      this.file = e.target.files[0];
    },

    // 重置状态
    reset() {
      this.disable = false;
      this.file = null;

      // 拉取文件清单
      this.buckets();
    },

    // 上传文件
    uploader() {
      // 防抖
      this.disable = true;

      // Use COS on Window
      window.cos.putObject(
        this.coset({
          Key: this.file.name,
          Body: this.file
        }),
        (e, data) => {
          if (e) {
            return console.error(`上传失败`, e);
          }

          this.reset();
          console.log(`上传成功`, data);
        }
      );
    },

    // 获取列表
    buckets() {
      window.cos.getBucket(
        this.coset({
          // 可选，指定要查询的目录路径
          Prefix: ''
        }),

        (e, data) => {
          if (e) {
            return console.error(`获取失败`, e);
          }

          this.list = data.Contents.filter((file) => !/\.js$/.test(file.Key)).map((file) => {
            // 格式化时间
            file.LastModified = this.format(file.LastModified);

            // 原样返回
            return file;
          });

          this.batch = Array(this.list.length).fill(false);

          console.log(`获取成功`, data);
        }
      );
    },

    // 生成二维码
    createQR() {
      console.log('appid:', this.appid);
      console.log('redirect:', this.redirect);
      console.log('state:', this.state);

      // 回跳
      const qrcode = `https://open.weixin.qq.com/connect/qrconnect?appid=${this.appid}&redirect_uri=${this.redirect}&response_type=code&scope=snsapi_login&state=${this.state}#wechat_redirect`;

      console.log('qrcode', qrcode);

      // 配置
      this.qrImage = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`;
      console.log('qrImage:', this.qrImage);
    }
  },

  mounted() {
    this.init();
  }
});
