'use strict';

var toReplace = document.querySelectorAll('script[language="JavaScript"]')[1]

var first = 
  '' + function doSubmit ( strURL, strAuthGp, strAuth, strStatus, strWindow ) {
    intRtnVal=fncControlSubmit ( 10 );
    if ( intRtnVal == true ) {
      window.open ( '', strWindow, 'toolbar=yes,menubar=yes,status=yes,scrollbars=yes,location=no,resizable=yes' );
      document.F01.url.value=strURL;
      document.F01.HID_P6.value=strAuthGp;
      document.F01.HID_P8.value=strAuth;
      document.F01.target='ap'
      document.F01.pageflag.value=1000;
      document.F01.status.value=strStatus;
      document.F01.target=strWindow;
      document.F01.submit();
    } else {
      alert ( 'It is dealing with it right now. Please click a menu again, after you click OK button and wait for a while.' );
    }
  } + ''
var second = 
  '' + function doWebMailSubmit ( intframe ) {
    window.open ( '', 'mail', 'menubar=no,status=yes,scrollbars=yes,location=no,resizable=yes' );
    document.F01.frame.value=intframe;
    document.F01.target='mail'
    document.F01.pageflag.value=1001;
    document.F01.NewOldFlg.value=0;
    document.F01.submit();      } + ''
var third = 
  '' + function doOldWebMailSubmit ( intframe ) {
    window.open ( '', 'oldmail', 'menubar=no,status=yes,scrollbars=yes,location=no,resizable=yes' );
    document.F01.frame.value=intframe;
    document.F01.target='oldmail'
    document.F01.pageflag.value=1001;
    document.F01.NewOldFlg.value=1;
    document.F01.submit();      } + ''
var fourth =
  '' + function doGetMailSubmit (  ) {
    document.F04.target='getmail'
    document.F04.submit();      } + ''
var fifth = 
  '' + function doGeneralSubmit ( url ) {
    window.open ( '', 'general', 'width=740,height=700,toolbar=no,scrollbars=yes,resizable=yes' );
    document.F02.submit();
  } + ''


var script = document.createElement('script');
script.textContent = [first, second, third, fourth, fifth].join('\n');
(document.head||document.documentElement).appendChild(script);

toReplace.remove()
