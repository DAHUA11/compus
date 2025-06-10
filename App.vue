<script>
 
	export default {
		onLaunch: function() {
			console.log('App Launch');
			
			// // 在小程序中预加载活动详情页面
			// // #ifdef MP-WEIXIN
			// uni.preloadPage({
			// 	url: 'pages/circle/activity-detail'
			// });
			// // #endif
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	/*每个页面公共css */
	@import '/static/fonts/iconfont.css';
	
	
	/* 全局样式 */
	page {
		font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Helvetica, 
			Segoe UI, Arial, Roboto, 'PingFang SC', 'miui', 'Hiragino Sans GB', 'Microsoft Yahei',
			sans-serif;
	}
</style>
