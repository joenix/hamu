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

    appid: `wx5d458ff8b11233f0`,
    redirect: encodeURIComponent(`http://api.hamuai.net/callback`),
    state: `hamuai`,

    qrImage: null
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

          this.list = data.Contents.filter((file) => !/\.js$/.test(file.Key));
          console.log(`获取成功`, data);
        }
      );
    },

    // 生成二维码
    createQR() {
      // 回跳
      const qrcode = `https://open.weixin.qq.com/connect/qrconnect?appid=${this.appid}&redirect_uri=${this.redirect}&response_type=code&scope=snsapi_login&state=${this.state}#wechat_redirect`;

      // 配置
      this.qrImage = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`;
      console.log('qrImage:', this.qrImage);
    }
  },

  mounted() {
    this.init();
  }
});
