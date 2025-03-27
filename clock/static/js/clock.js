  <script>
    function createCards(settings) {
      console.log(settings);
      const cards = [
        {
          title: "使用24小时制?",
          description: "使用24小时制, 例: 20:00 代替 8:00PM",
          formInput: "<input class='w3-check' type='checkbox' id='use24h' " + (settings.use24hformat == '1' ? "checked" : "") + "><label for='use24h'> 是的</label>",
          icon: "fa-clock-o",
          save: "updatePreference('use24hFormat', Number(use24h.checked))",
          property: "use24hFormat"
        },
        {
          title: "时区",
          description: "配置您的时区代码，<a href=\"https://github.com/nayarsystems/posix_tz_db/blob/master/zones.csv\" target=\"_blank\">查看地区代码列表</a> 。默认为：中国。 例如: Asia/Shanghai = CST-8",
          formInput: "<input id='posixString' class='w3-input w3-light-grey' name='posixString' type='text' placeholder='Manual Posix String' value='" + settings.manualposix + "'>",
          icon: "fa-globe",
          save: "updatePreference('manualPosix', posixString.value)",
          property: "manualPosix"
        },
        {
          title: "显示亮度",
          description: "0 = 暗 (关闭显示) / 255 = 最大亮度 | 默认值200, 如果你觉得白天时LED太亮，可调小此值，当前设置值: <strong><output id='rangevalue'>" + settings.displaybright + "</output></strong>，注意：只有下面的自动亮度设置为0,0，此选项才生效！",
          formInput: "<input class='w3-input w3-border' type='range' min='0' max='255' value='" + settings.displaybright + "' class='slider' id='bright' oninput='rangevalue.value=value'>",
          icon: "fa-adjust",
          save: "updatePreference('displayBright', bright.value)",
          property: "displayBright"
        },
        {
          title: "自动亮度",
          description: "请提供当房间黑暗时（最小值）和明亮时（最大值）光敏电阻（LDR）读取的数值范围，数值范围为0到4095，默认配置为0,2000，如需夜晚关闭显示，可配置为50,2000",
          formInput: "<input id='autoBrightMin' class='w3-input w3-light-grey w3-cell w3-margin-right' name='autoBrightMin' style='width:45%;' type='number' min='0' max='4095' placeholder='Min value' value='" + settings.autobrightmin + "'>" + 
                     "<input id='autoBrightMax' class='w3-input w3-light-grey w3-cell' name='autoBrightMax' style='width:45%;' type='number' min='0' max='4095' placeholder='Max value' value='" + settings.autobrightmax + "'>",
          icon: "fa-sun-o",
          save: "updatePreference('autoBright', autoBrightMin.value.padStart(4, '0') + ',' + autoBrightMax.value.padStart(4, '0'))",
          property: "autoBright"
        },
        {
          title: "旋转",
          description: "屏幕旋转的度数.",
          formInput: "<select name='rotation' id='rotation'><option value='0'" + (settings.displayrotation == 0 ? " selected='selected'" : "") + ">0</option><option value='1'" + (settings.displayrotation == 1 ? " selected='selected'" : "") + ">90</option><option value='2'" + (settings.displayrotation == 2 ? " selected='selected'" : "") + ">180</option><option value='3'" + (settings.displayrotation == 3 ? " selected='selected'" : "") + ">270</option></select>",
          icon: "fa-rotate-right",
          save: "updatePreference('displayRotation', rotation.value)",
          property: "displayRotation"
        }
      ];

      var base = document.querySelector('#base');
      cards.forEach(c => {
        if (!c.hasOwnProperty('exclusive') || (c.hasOwnProperty('exclusive') && c.exclusive === settings.clockface_name)) {
          var clone = base.cloneNode(true);
          clone.id = c.property + "-card";
          clone.removeAttribute("style");

          Array.prototype.slice.call(clone.getElementsByTagName('*')).forEach(e => {
            e.id = e.id + "-" + c.property;
          });

          base.before(clone);
          document.getElementById("title-" + c.property).innerHTML = c.title
          document.getElementById("description-" + c.property).innerHTML = c.description
          document.getElementById("formInput-" + c.property).innerHTML = c.formInput
          document.getElementById("icon-" + c.property).classList.add(c.icon);
          document.getElementById("cardButton-" + c.property).setAttribute("onclick", c.save);
        }
      })
      document.getElementById("ssid").innerHTML = "<i class='fa fa-wifi'></i> " + settings.wifissid
      document.getElementById("fw-version").innerHTML = "<i class='fa fa-code-fork'></i> 固件版本：" + settings.cw_fw_version
    }

    function updatePreference(key, value) {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status >= 200 && this.status < 299) {
          document.getElementById('status').style.display = 'block';
        }
      };
      xhr.open('POST', '/set?' + key + '=' + value);
      xhr.send();

      setTimeout(() => {
        document.getElementById('status').style.display = 'none';
      }, 2000);
    }

    function splitHeaders(request) {
      const headers = request.getAllResponseHeaders().trim().split(/[\r\n]+/);
      const headerMap = {};
      headers.forEach((line) => {
        const parts = line.split(": ");
        const header = parts.shift().substring(2);
        const value = parts.join(": ");
        headerMap[header] = value;
      });
      return headerMap;
    }

    function requestGet(path, cb) {
      var xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        if (this.readyState === 2 && this.status === 204) {
          cb(this);
        }
      };
      xmlhttp.open("GET", path, true);
      xmlhttp.send();
    }
    
    function readPin(pin) {
      requestGet("/read?pin=" + pin, (req) => {
        var headers = splitHeaders(req);
        document.getElementById("ldrPinRead").innerHTML = headers.pin;  
      });  
    }

    function begin() {
      requestGet("/get", (req) => {
        createCards(splitHeaders(req));
      });  
    }

    function restartDevice() {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/restart');
      xhr.send();
    }

    function erase() {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/erase');
        xhr.send();
    }
    begin();
  </script>