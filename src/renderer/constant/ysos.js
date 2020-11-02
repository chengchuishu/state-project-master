const YSOS = {
    CONFIG: {
      HOST: '127.0.0.1',
      PORT: '6002'
    },
    STATE: {
      // 准备模式
      PREPARE: 'PrepareService',
      // 服务模式
      ON: 'OnService',
      // 等待模式
      WAITING: 'WaitingService',
      // 等待模式-本地巡航
      WAITING_TARGETSEARCHING_LOCALSEARCHING: 'WaitingService@TargetSearching@LocalSearching',
      // 等待模式-定点巡航
      WAITING_TARGETSEARCHING_SPOTSEARCHING: 'WaitingService@TargetSearching@SpotSearching',
      // 等待模式-静止模式
      WAITING_TARGETSEARCHING_STATICSEARCHING: 'WaitingService@TargetSearching@StaticSearching',
      // 等待模式-定点行走
      WAITING_TARGETSEARCHING_MOVETOPOINT: 'WaitingService@TargetSearching@MoveToPoint',
      // 挂起模式
      SUSPEND: 'SuspendService',
      // 挂起模式-上班前
      SUSPEND_POWERMANAGER_BEFOREWORK: 'SuspendService@PowerManager@BeforeWork',
      // 挂起模式-准备充电
      SUSPEND_POWERMANAGER_PREPARECHARGING: 'SuspendService@PowerManager@PrepareCharging',
      // 挂起模式-正在充电
      SUSPEND_POWERMANAGER_ONCHARGING: 'SuspendService@PowerManager@OnCharging',
      // 挂起模式-充电失败
      SUSPEND_POWERMANAGER_FAILEDTOCHARGE: 'SuspendService@PowerManager@FailedToCharge'
    },
    PREPARE: {
      // 初始化服务
      INIT: 'Init',
      // 切换通知服务
      SWITCH_NOTIFY: 'SwitchNotify',
      // 状态切换服务
      SWITCH: 'Switch',
      // 状态准备完毕服务
      READY: 'Ready',
      // 事件通知服务
      EVENT_NOTIFY: 'EventNotify',
      // 心跳包
      HEART_BEAT: 'Heartbeat',
      // 获取数据
      GET_DATA: 'GetData'
    },
    EVENT: {
    },
    EMIT: {
      TYPE_SWITCH: '31016',
      SERVICE_NAME_SWITCH: 'Switch',
      TYPE_READY: '31026',
      SERVICE_NAME_READY: 'Ready',
      // 自定义发送
      CUSTOM: 'CustomEvent',
      TEMPLATE_GENERATE_EVENT: 'template_generate_event'
    }
  }
  
  export default YSOS
  