var sSupplierID = "";
var Suppliers = [];
var Makers = [];
var Sellers = [];
var sMakerJSON;
var sIndustry = 'AUTO';
var ProdSchemas = [];
var sShipmentEvents = [];
var sConfigDataJSON;
var urlParams= {};
var sLocations = ["41.98,-83.67", "42.13,-83.19", "42.37,-82.96", "40.75,-73.90"]; 
var sAutoLocationDescs = ["Engine Assemply Plant", "Manufacturing Plant", "Warehouse" , "Auto Dealer"]; 
var sSellerData = [];
var sProductData;
//assembly, manu, packaging, seller


$(document).ready(function(){
	//getParam();
  openNav();
    
});

$("#assemblyschemaid").change(function(){
  var selSchema = $(this).val();
  $.each(ProdSchemas, function(i, item) {
    if (item.assetstate.productschema.productschemaId==selSchema) {
        $("#assemblyprodcode").val(item.assetstate.productschema.productcode);
        $("#assemblyproddesc").val(item.assetstate.productschema.productschemaDescription);
        var jsonObj = JSON.parse(item.assetstate.productschema.productSchemaContent);
        var jsonPretty = JSON.stringify(jsonObj, null, '\t');
        $("#assemblyschemadefn").val(jsonPretty);
      }
    });
});

$("#productschemaid").change(function(){
  var selSchema = $(this).val();
  $.each(ProdSchemas, function(i, item) {
    if (item.assetstate.productschema.productschemaId==selSchema) {
        $("#productprodcode").val(item.assetstate.productschema.productcode);
        $("#productproddesc").val(item.assetstate.productschema.productschemaDescription);
        var jsonObj = JSON.parse(item.assetstate.productschema.productSchemaContent);
        var jsonPretty = JSON.stringify(jsonObj, null, '\t');
        $("#productschemadefn").val(jsonPretty);
      }
    });
});

$("#packagesellername").change(function(){
  var selSeller = $(this).val();
  $.each(sSellerData, function(i, item) {
    if (item.assetstate.seller.sellerAddress.name==selSeller) {
        $("#packagesellerid").val(item.assetstate.seller.sellerId);
        populateSellerOrders(item.assetstate.seller.sellerId);
      }
    $("#packagedestination").val(sAutoLocationDescs[3]);
    $("#packagedestinationlatlong").val(sLocations[3]);
    });
});

$("#makeassembly").on("click", function(){
  if ($("#assemblyschemaid").val() == "--Select--") {
    alert("Please select a valid assembly schema definition");
  } else {
    var iProdCount = parseInt($("#assemblycount").val());
    var sBatchId = $("#assemblyschemaid").val()+'-'+uniqId();
    var sProdId = "";
    var sOrderId = "INT-ABL-"+sBatchId;
    var sProdString = "";
    for (i=0;i<iProdCount; i++)
    {
        sProdId = sBatchId+padToFour(i);
        sProdString = i==0?sProdId:(sProdString+'\n'+sProdId);
    }
    $("#assemblybatchid").val(sBatchId);
    $("#assemblyoderid").val(sOrderId);
    $("#assemblyprodids").val(sProdString);
    $("#assemblydestination").val(sAutoLocationDescs[1]);
    $("#assemblydestinationlatlong").val(sLocations[1]);
  }
});

$("#makeproduct").on("click", function(){
  if ($("#productschemaid").val() == "--Select--") {
    alert("Please select a valid product schema definition");
  } else {
    var iProdCount = parseInt($("#productcount").val());
    var sBatchId = $("#productschemaid").val()+'-'+uniqId();
    var sProdId = "";
    var sOrderId = "INT-PRD-"+sBatchId;
    var sProdString = "";
    for (i=0;i<iProdCount; i++)
    {
        if (urlParams.industry=="AUTO") { // Generate Faux VIN number for Auto
          sProdId = (stringGen(13)+(new Date%9e6).toString(36)).toUpperCase();
        } else { 
          sProdId = (sBatchId+padToFour(i)).trim();
        }
        sProdString = i==0?sProdId:(sProdString+'\n'+sProdId);
    }
    $("#productbatchid").val(sBatchId);
    $("#productoderid").val(sOrderId);
    $("#productprodids").val(sProdString);
    $("#productdestination").val(sAutoLocationDescs[2]);
    $("#productdestinationlatlong").val(sLocations[2]);
  }
});

$("#shipassembly").on("click", function(){
  sAggrLevel = "0";
  createandShipProducts(sAggrLevel);
});

$("#shipproduct").on("click", function(){
  sAggrLevel = "1";
  createandShipProducts(sAggrLevel);
});
$("#shiptoseller").on("click", function(){
  shipProducts();
});


$('#navcol-1').on('click', 'li > a', function() {
	//alert($(this).text());
	if($(this).text() =="Meter")
	{
		$('#backend').collapse('hide');
    openNav();
	}
	if($(this).text() =="Backend")
	{
		$('#meter').collapse('hide');
    closeNav();
	}
	if($(this).text() =="Assets")
	{
		$('#schemas').collapse('hide');
		$('#make').collapse('hide');
		$('#track').collapse('hide');
    populateOrders();
    populateProducts();
    closeNav();
	}
  if($(this).text() =="Track")
  {
    $('#schemas').collapse('hide');
    $('#make').collapse('hide');
    $('#assets').collapse('hide');
    closeNav();
    $("#btnmap").click();

  }

});

  ////////////////////////////////////////////////////////////

  function getParam() {

    var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        query  = window.location.search.substring(1);
    while (match = search.exec(query))
       urlParams[decode(match[1])] = decode(match[2]);
     //alert(urlParams.makerId);
     //setTitles();
}

/////////////////////
/* Set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("main").style.marginLeft = "250px";
    $("#navcol-1 li a").filter("[data-pdsa-dropdown-val=0]").trigger("click");
    //document.body.style.backgroundColor = "rgba(0,0,0,0.4)";
}

/* Set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white */
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("main").style.marginLeft = "0";
    //document.body.style.backgroundColor = "white";
}
///////////////////////////
function submitSchema() {
  var sFunctionName = "";
  var sSchemaId = "";
  var sMakerId = urlParams;
  var sSchType = "0";
  var sToday = new Date().toJSON().slice(0,10).replace(/-/g,'/');
  var sUrl = sConfigDataJSON.configdata.apihostandport+'/chaincode';
  //alert($("#schemadefinition").val());
  if ($("#schemadefinition").val().trim()=="") {
    alert("Please enter the schema in json format");
  }
  if($("#schemaid").val() == "") {
    // This implies that this is a new schema definition 
    sFunctionName = "createAssetProductSchema";
    sSchemaId = $("#schemaprodcode").val()+'-'+uniqId();
  } else {
    // The schema id was pre-populated, so its an old schema definition
    sFunctionName = "updateAssetProductSchema";
    sSchemaId = $("#schemaid").val();
  }
  if ($("#schematype").val() =="Assembly"){
    sSchType = "0";
  } else {
    sSchType = "1";
  }
   //alert(sSchemaId);
   //alert(sFunctionName);
   var sSchemDefn =JSON.stringify(JSON.parse($("#schemadefinition").val()));
   var sSchemDefnFinal = sSchemDefn.replace(/\x22/g, '\\\\\\"');
   //alert (sSchemDefnFinal);
  var jsonString = '{"jsonrpc":"2.0","method":"invoke","params":{"type":1,"chaincodeID":{"name":"';
    jsonString+=sConfigDataJSON.configdata.chaincodeid+'"},"ctorMsg":{"function":"'+sFunctionName+'","args":';
    jsonString+='["{\\\"productschema\\\":{\\\"industryType\\\":\\\"'+$("#schemaindustry").val()+'\\\", \\\"makerId\\\":\\\"';
    jsonString+=$("#schemamakername").val()+'\\\",\\\"productSchemaContent\\\":\\\"'+sSchemDefnFinal+'\\\"';
    jsonString+=',\\\"productcode\\\":\\\"'+$("#schemaprodcode").val()+'\\\",\\\"productschemaCreationDate\\\":\\\"'+sToday+'\\\"';
    jsonString+=',\\\"productschemaDescription\\\":\\\"'+$("#schemaprodname").val()+'\\\",\\\"productschemaId\\\":\\\"'+sSchemaId+'\\\"';
    jsonString+=' ,\\\"productschemaStatus\\\":\\\"New\\\",\\\"productschemaType\\\":'+sSchType+'}}"]},"secureContext":"'+sConfigDataJSON.configdata.seccontext+'"},"id":5}';
    //alert ("Schema defn string is " +jsonString);
    //alert("url is "+sUrl);
  $.ajax({
      type: "POST",
      url: sUrl,
      data: jsonString,
      dataType:"json",
      success: function(data, textStatus, jqXHR)
      {
        alert("Schema definition successful");
        $("#newschema").trigger("click");
        console.log(JSON.stringify(data));
        populateSideNav();
      },
      error: function (jqXHR, textStatus, errorThrown)
      {
        alert('errorThrown');
        console.log("Error updating supply record" + errorThrown);
      }
  });

        
  }
///////////////////////////
function uniqId() {
    if ( typeof uniqId.counter == 'undefined' ) {
        uniqId.counter = 0;
        uniqId.prefix = new Date().getTime();
    }
    return uniqId.prefix + "-" + uniqId.counter++;
}
///////////////////////////
function populateSideNav() {
  var sUrl = sConfigDataJSON.configdata.apihostandport+'/chaincode';
  //alert("Populate SideNav");
  $("#mySidenav").empty();
  //$('#mySidenav').append('<a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>');
  var sInnerHTML = '<a href="javascript:void(0)" class="closebtn" onclick="closeNav()">&times;</a>';
  var jsonString = '{"jsonrpc":"2.0","method":"query","params":{"type":1,"chaincodeID":{"name":"';
  jsonString+=sConfigDataJSON.configdata.chaincodeid+'"},"ctorMsg":{"function":"readAllAssetsProductSchema","args":';
  jsonString+='["{\\\"filter\\\":{\\\"match\\\":\\\"all\\\",\\\"select\\\":{\\\"0\\\":';
  jsonString+='{\\\"qprop\\\":\\\"assetstate.productschema.industryType\\\",\\\"value\\\":\\\"'+sIndustry+'\\\"},';
  jsonString+='\\\"1\\\":{\\\"qprop\\\":\\\"assetstate.productschema.makerId\\\",\\\"value\\\":\\\"'+urlParams.makerId+'\\\"}}}}"]},';
  jsonString+='"secureContext":"'+sConfigDataJSON.configdata.seccontext+'"},"id":1234}';
  //alert("Product Schema definitions query is: " +jsonString);
  $.ajax({
      type: "POST",
      url: sUrl,
      data: jsonString,
      dataType:"json",
      success: function(data, textStatus, jqXHR)
      {
        //alert(data.result.message);
        schemas = $.parseJSON(data.result.message);
        ProdSchemas = schemas; // This will be used to populate the side nav as well as individual records on click
        //alert(JSON.stringify(ProdSchemas));
        populateSchemaList();
        try {
            $.each(schemas, function(i, item) {
              var sSchemaId = item.assetstate.productschema.productschemaId;
              sInnerHTML+='<a href="#" onclick=populateSchemaDetails("'+sSchemaId+'")>'+sSchemaId+' </a>';
              //alert(sInnerHTML);
              
            });
            //alert(sInnerHTML);
            $('#mySidenav').append(sInnerHTML);
          } catch(err) {
            console.log('Warning: ' +err.message);
          }
      },
      error: function (jqXHR, textStatus, errorThrown)
        {
          console.log(errorThrown);
        }
    });  
}
///////////////////////////
function populateSchemaDetails(sSchemaId) {
  $.each(ProdSchemas, function(i, item) {
    if (item.assetstate.productschema.productschemaId ==sSchemaId) {
      //alert(JSON.stringify(item));
      $("#schemaindustry").val(item.assetstate.productschema.industryType);
      $("#schemaid").val(sSchemaId);
      $("#schemamakername").val(item.assetstate.productschema.makerId);
      $("#schemaprodcode").val(item.assetstate.productschema.productcode);
      $("#schemaprodname").val(item.assetstate.productschema.productschemaDescription);
      if(item.assetstate.productschema.productschemaType=="0") {
        $("#schematype").val("Assembly");
      } else {
        $("#schematype").val("Product");
      }
      var jsonObj = JSON.parse(item.assetstate.productschema.productSchemaContent);
      var jsonPretty = JSON.stringify(jsonObj, null, '\t');
      $("#schemadefinition").val(jsonPretty);
    }
  });
}
///////////////////////////////
function populateSchemaList(){
   $('#assemblyschemaid').empty();
   $('#productschemaid').empty();
   var iAblCount = 0;
   var iPrdCount = 0;
  $.each(ProdSchemas, function(i, item) {
    if (item.assetstate.productschema.productschemaType=="0") {
       if (iAblCount ==0)
       {
          $('#assemblyschemaid').append('<option selected> --Select-- </option>');
          $('#assemblyschemaid').append('<option>'+item.assetstate.productschema.productschemaId+'</option>');
          iAblCount++;
       } else {
        $('#assemblyschemaid').append('<option>'+item.assetstate.productschema.productschemaId+'</option>');
       }
     } else {
      if (iPrdCount ==0)
       {
          $('#productschemaid').append('<option selected> --Select-- </option>');
          $('#productschemaid').append('<option>'+item.assetstate.productschema.productschemaId+'</option>');
          iPrdCount++;
       } else {
        $('#productschemaid').append('<option>'+item.assetstate.productschema.productschemaId+'</option>');
       }

     }
  });
}
/////////////////////////////////////////////////////////////////////////////////////

function populateSupplies(data) {
   
   $("#suppliesList").empty();
   $('#suppliesList').append('<thead> <tr> <th>Supply Batch ID</th><th>Description </th><th>Type </th> <th>Year </th><th>Qty </th> <th>Details </th><th hidden>ids</th></tr> </thead>'); 
    //alert('inside loadSupplies');
    var jsonString = '{"jsonrpc":"2.0","method":"query","params":{"type":1,"chaincodeID":{"name":"';
    jsonString+=data.configdata.chaincodeid+'"},"ctorMsg":{"function":"readAllAssetsSupply","args":';
    jsonString+='["{\\\"filter\\\":{\\\"match\\\":\\\"all\\\",\\\"select\\\":{\\\"0\\\":';
    jsonString+='{\\\"qprop\\\":\\\"assetstate.supply.industryType\\\",\\\"value\\\":\\\"'+sIndustry+'\\\"},';
    jsonString+='\\\"1\\\":{\\\"qprop\\\":\\\"assetstate.supply.supplyStatus\\\",\\\"value\\\":\\\"Shipped\\\"},';
    jsonString+='\\\"2\\\":{\\\"qprop\\\":\\\"assetstate.supply.makerId\\\",\\\"value\\\":\\\"'+urlParams.makerId+'\\\"}}}}"]},';
    jsonString+='"secureContext":"'+data.configdata.seccontext+'"},"id":1234}';

   //alert("Supplier query is: " +jsonString);

   $.ajax({
      type: "POST",
      url: data.configdata.apihostandport+'/chaincode',
      data: jsonString,
      dataType:"json",
      success: function(data, textStatus, jqXHR)
      {
        //alert(data.result.message);
        supplies = $.parseJSON(data.result.message);
        //alert(JSON.stringify(supplies))
        var trHTML = '<tbody>';
        var trShippedHTML = '<tbody>';
        try {
          var sBatchID ='';
          var iBatchCount =0;
          var sDescription = '';
          var sType = '';
          var sSupplyList = '';
          var sDate= '';
          var trInnerHTML = "";
          var bOutstandingNewRow = true;
          var newBtn = "";
          var newShippedBtn = "";
          //alert(supplies.length + ' supplies');
          $.each(supplies, function(i, item) {
            var supplyAggregationLevel = item.assetstate.supply.supplyAggregationLevel;
            var sSupType = supplyAggregationLevel=='0'?'Raw Materials':supplyAggregationLevel=='1'?'Components':'Subassembly';
              
            //alert('sBatchID is',sBatchID);
            if(sBatchID =='') {
              sBatchID = item.assetstate.supply.supplyBatchId;
              iBatchCount=1;
              sDescription = item.assetstate.supply.supplyDescription;
              sType = sSupType;
              sDate = item.assetstate.supply.supplyAvailableDate;
              divId = 'div'+sBatchID;
              sSupplyList = item.assetstate.supply.supplyId;
              trInnerHTML = '<div id="'+divId+'" class="collapse"> <div class="row"> <div class="col-md-3"></div><div class="col-md-3">';
              trInnerHTML +=  item.assetstate.supply.supplyId+'</div></div>';  
            } else if(sBatchID == item.assetstate.supply.supplyBatchId) {
              iBatchCount++;
              sSupplyList += ','+item.assetstate.supply.supplyId;
              trInnerHTML += '<div class="row"> <div class="col-md-3"></div><div class="col-md-1">'+item.assetstate.supply.supplyId+'</div></div>';
            } else {
              // Add the aggregated data and its subordinate div as a row.
              trInnerHTML +='</div';
              var buttonid = 'but'+sBatchID;
              newBtn = '<button btn btn-info data-toggle="collapse" data-target="#'+divId+'">+</button>';
              //alert(newBtn);
              trHTML = '<tr height="40"><td > ' + sBatchID +
              '</td><td > ' + sDescription+ '</td><td>' + sType + '</td><td>' + sDate +'</td><td>' + 
              iBatchCount +'</td> <td>'+newBtn+'</td><td hidden id = "'+sBatchID+'_list">'+sSupplyList+'</td></tr></tr><td></td><td><small>'+trInnerHTML+'</small></td></tr>';  
              //alert(trHTML);
              $('#suppliesList').append(trHTML);

              // Now add the new batch as a new row.
         
              sBatchID = item.assetstate.supply.supplyBatchId;
              //alert('New Batch id '+sBatchID);
              iBatchCount=1;
              sDescription = item.assetstate.supply.supplyDescription;
              sType = sSupType;
              sDate = item.assetstate.supply.supplyAvailableDate;
              divId = 'div'+sBatchID;
              trInnerHTML = '<div id="'+divId+'" class="collapse"> <div class="row"> <div class="col-md-3"></div><div class="col-md-3">';
              trInnerHTML +=  item.assetstate.supply.supplyId+'</div></div>'; 
              newBtn = '<button btn btn-info data-toggle="collapse" data-target="#'+divId+'">+</button>';
              bOutstandingNewRow = true;
            }
           });
          if (bOutstandingNewRow)
          {
            trHTML = '<tr height="40"><td > ' + sBatchID +
              '</td><td > ' + sDescription+ '</td><td>' + sType + '</td><td>' + sDate +'</td><td>' + 
              iBatchCount +'</td> <td>'+newBtn+'</td><td hidden id = "'+sBatchID+'_list">'+sSupplyList+'</td></tr></tr><td></td><td><small>'+trInnerHTML+'</small></td></tr>';  
              $('#suppliesList').append(trHTML);
              sBatchID ='';
          }
          
          $('#suppliesList').append('</tbody>');    

          }
          catch(err) {
            console.log('Warning: ' +err.message);
          }
          
     
        //alert("Auto Suppliers: "+ AutoSuppliers.toString());
        //alert("Pharma Suppliers: "+ PharmaSuppliers.toString());
        //alert("Food Suppliers: "+ FoodSuppliers.toString());  
        
      },
      error: function (jqXHR, textStatus, errorThrown)
        {
          console.log(errorThrown);
        }
    });
  };
//////////////////////
function populateOrders() {
   var trHTML = "<tbody>";
   $("#ordersList").empty();
   $('#ordersList').append('<thead> <tr> <th>Order ID</th><th>Issuer </th><th>Type </th> <th>Description </th> <th>Status </th><th>Track </th> </tr> </thead>'); 
    //alert('inside loadSupplies');
    var jsonString = '{"jsonrpc":"2.0","method":"query","params":{"type":1,"chaincodeID":{"name":"';
    jsonString+=sConfigDataJSON.configdata.chaincodeid+'"},"ctorMsg":{"function":"readAllAssetsOrder","args":';
    jsonString+='["{\\\"filter\\\":{\\\"match\\\":\\\"all\\\",\\\"select\\\":{\\\"0\\\":';
    jsonString+='{\\\"qprop\\\":\\\"assetstate.order.industryType\\\",\\\"value\\\":\\\"'+urlParams.industry+'\\\"},';
    jsonString+='\\\"1\\\":{\\\"qprop\\\":\\\"assetstate.order.orderFulfiller.Id\\\",\\\"value\\\":\\\"'+urlParams.makerId+'\\\"}}}}"]},';
    jsonString+='"secureContext":"'+sConfigDataJSON.configdata.seccontext+'"},"id":1234}';

   //alert("Orders query is: " +jsonString);

   $.ajax({
      type: "POST",
      url: sConfigDataJSON.configdata.apihostandport+'/chaincode',
      data: jsonString,
      dataType:"json",
      success: function(data, textStatus, jqXHR)
      {
        //alert(data.result.message);
        orders = $.parseJSON(data.result.message);
        $.each(orders, function(i, item) {
          sOrderID = item.assetstate.order.orderId;
          trHTML='<tr> <td height="30"> '+sOrderID+'</td> <td>'+item.assetstate.order.orderIssuer.oderIssuerId+'</td>';
          trHTML+='<td> '+item.assetstate.order.orderType+'</td> <td>'+item.assetstate.order.orderDescription+'</td> <td>';
          trHTML+=item.assetstate.order.orderStatus+'</td>';
          trHTML+='<td><button type="button" class="btn btn-info" onclick=trackMe("'+sOrderID+'")</td> </tr>';
          $('#ordersList').append(trHTML); 
        });  
        $('#ordersList').append('</tbody>'); 
      },
      error: function (jqXHR, textStatus, errorThrown)
        {
          console.log(errorThrown);
        }
    });
  };
//////////////////////
//////////////////////
function populateProducts() {
   var trHTML = "<tbody>";
   //alert("populateProducts");
   $("#productsList").empty();
   $('#productsList').append('<thead> <tr> <th>Product ID</th><th>Order # </th><th>Type </th> <th>Description </th> <th>Batch ID </th> <th>Status </th></tr> </thead>'); 
    var jsonString = '{"jsonrpc":"2.0","method":"query","params":{"type":1,"chaincodeID":{"name":"';
    jsonString+=sConfigDataJSON.configdata.chaincodeid+'"},"ctorMsg":{"function":"readAllAssetsProduct","args":';
    jsonString+='["{\\\"filter\\\":{\\\"match\\\":\\\"all\\\",\\\"select\\\":{\\\"0\\\":';
    jsonString+='{\\\"qprop\\\":\\\"assetstate.product.industryType\\\",\\\"value\\\":\\\"'+urlParams.industry+'\\\"},';
    jsonString+='\\\"1\\\":{\\\"qprop\\\":\\\"assetstate.product.makerId\\\",\\\"value\\\":\\\"'+urlParams.makerId+'\\\"}}}}"]},';
    jsonString+='"secureContext":"'+sConfigDataJSON.configdata.seccontext+'"},"id":1234}';

   //alert("Products query is: " +jsonString);

   $.ajax({
      type: "POST",
      url: sConfigDataJSON.configdata.apihostandport+'/chaincode',
      data: jsonString,
      dataType:"json",
      success: function(data, textStatus, jqXHR)
      {
        //alert(data.result.message);
        products = $.parseJSON(data.result.message);
        $.each(products, function(i, item) {
          //alert("In here");
          sProd = item.assetstate.product.productType;
          sProductType = sProd=="0"?"Component":"Product";
          //alert(sProductType);
          trHTML+='<tr> <td>'+item.assetstate.product.productId+'</td>';
          trHTML+='<td> '+item.assetstate.product.orderId+'</td> <td>'+sProductType+'</td> <td>';
          trHTML+=item.assetstate.product.productDescription+'</td> <td>';
          trHTML+=item.assetstate.product.productBatchId+'</td> <td>';
          trHTML+=item.assetstate.product.productStatus+'</td> </tr>';
          //alert(trHTML); 
        });  
        $('#productsList').append(trHTML);
        $('#productsList').append('</tbody>'); 
        },
      error: function (jqXHR, textStatus, errorThrown)
        {
          console.log(errorThrown);
        }
      });
    
  };
//////////////////////
/////////////////////////////////////////////
  function createandShipProducts(sAggrLevel) {
      var prodIdList ="";
      var sToday = new Date().toJSON().slice(0,10).replace(/-/g,'/');
      var sChaincodeId = sConfigDataJSON.configdata.chaincodeid;
      var sSecureContext = sConfigDataJSON.configdata.seccontext;
      var sUrl = sConfigDataJSON.configdata.apihostandport+'/chaincode';
      var sSchemDefnFinal = "";
      var sOrderId = "";
      var sBatchId = "";
      var sSchemaId = "";
      var sDescription = "";
      // Iterate through and ship products. For automotive, we will have a faux VIN number generated.
      // Others TBD. Generate interal product id if Auto otherwise external and internal can be the same.
      if (sAggrLevel =="0") {
          prodIdList = $("#assemblyprodids").val();
          if (prodIdList.length ==0) {
            alert("Please generate the assembly/assemblies and order first"); 
            return;
          }
          //alert('assemblyschemadefn ' + $("#assemblyschemadefn").val());
          var sSchemDefn =JSON.stringify(JSON.parse($("#assemblyschemadefn").val()));
          sSchemDefnFinal = sSchemDefn.replace(/\x22/g, '\\\"');
          //alert (sSchemDefnFinal);
          sOrderId = $("#assemblyoderid").val();
          sBatchId = $("#assemblybatchid").val();
          sSchemaId = $("#assemblyschemaid").val();
          sDescription = $("#assemblyproddesc").val();  
      } else{

          prodIdList = $("#productprodids").val();
          if (prodIdList.length ==0) {
            alert("Please generate the product(s) and order first"); 
            return;
          }
          //alert('prodIdList length is' + prodIdList.length);
          var sSchemDefn =JSON.stringify(JSON.parse($("#productschemadefn").val()));
          sSchemDefnFinal = sSchemDefn.replace(/\x22/g, '\\\"');
          //alert ("sSchemDefnFinal : "+sSchemDefnFinal);
          sOrderId = $("#productoderid").val();
          sBatchId = $("#productbatchid").val();
          sSchemaId = $("#productschemaid").val();
          sDescription = $("#productproddesc").val();
      } 
      //alert(prodIdList);
      //alert("prodIdList.length is "+prodIdList.length); 
      var lines = [];
      $.each(prodIdList.split(/\n/), function(i, line){
          if(line){
              lines.push(line);
          } else {
              lines.push("");
          }
      });
      if (lines.length ==0) {
        lines.push(prodIdList);
      }

      $.each(lines, function(iter, thisline) {
        if (thisline.trim() != "") {
          // Create product record for eaach product
          var sIntProdId ="";
          if (urlParams.industry == "AUTO" && sAggrLevel =="1") {
              sIntProdId =(sBatchId+padToFour(iter)).trim();
          } else {
            sIntProdId =thisline.trim();
          }
          
           var jsonString = '{ "jsonrpc": "2.0","method": "invoke","params": {"type": 1,"chaincodeID": ';
          jsonString+='{"name": "'+ sChaincodeId+ '"}, "ctorMsg": { "function": "createAssetProduct" ';
          jsonString+=', "args":["{\\\"product\\\":{\\\"industryType\\\":\\\"'+urlParams.industry+'\\\",';
          jsonString+='\\\"madeOf\\\":'+sSchemDefnFinal+',\\\"makerId\\\":\\\"'+urlParams.makerId+'\\\"';
          jsonString+=',\\\"manufacturingDate\\\":\\\"'+sToday+'\\\",\\\"orderId\\\":\\\"'+sOrderId+'\\\"';
          jsonString+=',\\\"productBatchId\\\":\\\"'+sBatchId+'\\\", \\\"productId\\\":\\\"'+thisline+'\\\"';
          jsonString+=',\\\"productInternalId\\\":\\\"'+sIntProdId+'\\\",\\\"productSchemaId\\\":\\\"';
          jsonString+=sSchemaId+'\\\",\\\"productDescription\\\":\\\"'+sDescription+'\\\", \\\"productStatus\\\":\\\"New\\\",';
          jsonString+='\\\"productType\\\":\\\"'+sAggrLevel+'\\\"}}"]},"secureContext":"'+sSecureContext+'"},"id":1234}';
          //alert('jsonString is ' +jsonString);
          $.ajax({
              type: "POST",
              url: sUrl,
              data: jsonString,
              dataType:"json",
              success: function(data, textStatus, jqXHR)
              {
                console.log(JSON.stringify(data));
                //alert('success '+supplybatchId);
                clearPanel(sAggrLevel);
              },
              error: function (jqXHR, textStatus, errorThrown)
              {
                console.log("Error updating supply record" + errorThrown);
              }
          });
        }
      });
        
        /* 
        

      fStartLat = parseFloat(item.assetstate.order.orderFulfilmentLocation.latitude);
        fStartLong = parseFloat(item.assetstate.order.orderFulfilmentLocation.longitude);
        fEndLat = parseFloat(item.assetstate.order.orderDeliveryLocation.latitude);
        fEndLong = parseFloat(item.assetstate.order.orderDeliveryLocation.longitude);
        dDueDate = item.assetstate.order.orderFulfiller.committedDeliveryDate;
        sIndustryType = item.assetstate.order.industryType;
        sorderContentType = item.assetstate.order.orderContentType;
        sorderDescription = item.assetstate.order.orderDescription;
        sbolId='BL'+'_'+supplybatchId;
        sCheckPointLat =fStartLat;
        sCheckPointLong = fStartLong;
        var dNewDueDate = new Date();
        dCurDate = new Date(currTime);
        dDueDate = new Date(dDueDate)
        dNewDueDate.setDate(dNewDueDate.getDate() + 5);
        if ( dCurDate > dDueDate) {
          dDueDate = dNewDueDate; //adding 5 days to current date for calc
          // This will be the new actual arrival date
        }
        // Start creating the record to send to node-red
        var sOrderData = '{"orderId":"'+sOrderId+'", "industryType": "'+sIndustryType+'", "orderContentType":"'+sorderContentType+'"';
        sOrderData+=', "orderDescription": "'+sorderDescription+'", "bolId":"'+sbolId+'","orderStatus": "Shipped", "orderType":"Manufacturing"';
        sOrderData+=', "actualFulfilmentDate": "'+dNewDueDate+'","distCheckpoints":[';
        // Calculate distance between the locations
        var start = [fStartLat, fStartLong];
        var end = [fEndLat, fEndLong];
        var total_distance = gis.calculateDistance(start, end); // meters
        //Simple assumption - equal distances, equal times
        //percent decides the number of stops between source and destination
        //late arrival determines whether it is ok to arrive late. 
        // For now, it is to be set to true
        var percent = 10; // to do - make this configurable 
        var distance = (percent / 100) * total_distance;
        var bearing = gis.getBearing(start, end);  
        iLegs = 100/percent;
        
        var diff = Math.abs(dDueDate - dCurDate);
        var timeDifference = Math.floor((diff/1000)/60/iLegs);
        var nextTime = currTime;
        nextTime.setMinutes(nextTime.getMinutes() + timeDifference);
        // Generate the legs of the journey
        for (j=0; j<iLegs;j++) {
          var new_coord = gis.createCoord(start, bearing, distance);
          var new_coord1 = new_coord;
          var straightLine = coinFlip();
          //alert(straightLine);
          if (straightLine) {
              new_coord1[0] = new_coord1[0]+0.5;
              new_coord1[1] = new_coord1[1]-0.25;
          }
          if (j==0){
            new_coord1[0]= fStartLat;
            new_coord1[1]= fStartLong;
          }
          if (j==iLegs-1){
            new_coord1[0]= fEndLat;
            new_coord1[1]= fEndLong;
          }
          start = new_coord;
          nextTime.setMinutes(nextTime.getMinutes() + timeDifference);
          sOrderData+='{"checkpointLocation":{"latitude":'+new_coord1[0]+', "longitude":'+new_coord1[1]+'}, "checkpointName": "Checkpoint-'+(j+1)+'"';
          sOrderData+=', "checkPointEvents": '+sShipmentEvents[j];
          sOrderData+=', "checkPointShock": [{"AccX":"'+accVal()+'"} ,{"AccY":"'+accVal()+'"},{"AccZ":"'+accVal()+'"}]';
          sOrderData+=', "checkPointTemperature":"'+tempVal()+'"';
          sOrderData+= ', "checkpointDate": "'+nextTime.toString()+'"}';
          if (j<iLegs-1) {sOrderData+= ','};
        }
        sOrderData+= ']}';
        $('#temptext').val(sOrderData); 
        // Send the order record to the node-red flow to trigger watson IoT calls
        //sStart = "http://127.0.0.1:1880/shipSupplies";
        sStart = "http://127.0.0.1:1880/shipSuppliesTest";
         $.ajax({
            type: "POST",
            url: sStart,
            data: sOrderData,
            dataType:"json",
            contentType: "text/plain",
            success: function(data, textStatus, jqXHR)
            {
               //console.log(JSON.stringify(data));
               console.log("Node-red call is a success");
            },
            error: function (jqXHR, textStatus, errorThrown)
            {
              console.log(errorThrown);
            }
            
        });*/
      
}
//////////////////////
function padToFour(number) {
  if (number<=9999) { number = ("000"+number).slice(-4); }
  return number;
}

function makeid()
{
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
///////////////////////////
function stringGen(len)
{
    var text = " ";

    var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < len; i++ )
        text += charset.charAt(Math.floor(Math.random() * charset.length));

    return text;
}
////////////////////////////
function setInternalShippingEvents(sShipmentEvents) {
  sStartEvents = '[{\"E159\":\"Booking Confirmed\"},{\"E303\":\"Shipping instructions\"},{\"E229\":\"Container stuffed\"}, {\"E014\":\"Container sealed\"},{\"E217\":\"Gate in full for export\" }';
  if (sIndustry == 'PHARMA') {
    sStartEvents+=', {\"E267\":\"Dangerous goods declaration available\"}, {\"E319\":\"Reefer manifest\"}, {\"E320\":\"Dangerous goods manifest\"}';
  }
  if (sIndustry == 'FOOD') {
    sStartEvents+=', {\"E332\":\"Phyto check done\"}, {\"E053\":\"Phyto certificate approved\"}, {\"E319\":\"Reefer manifest\"}';
  }
  sStartEvents+=', {\"E291\":\"Container commercial release -Freight charge paid\"}, {\"E270\":\"Container Device Started\"},{\"E273\":\"Temperature read\"}, {\"E999\":\"Other Event - Shock measured\"}]';
  sShipmentEvents.push(sStartEvents) ;
  sShipmentEvents.push('[{\"E273\":\"Temperature read\"}, {\"E999\":\"Other Event - Shock measured\"}]');
  sShipmentEvents.push('[{\"E299\":\"Next mode of transport\"},{\"E273\":\"Temperature read\"}, {\"E999\":\"Other Event - Shock measured\"}]');
  sShipmentEvents.push('[{\"E325\":\"Container seal inspected\"}, {\"E265\":\"Verified Gross Mass\"}, {\"E068\":\"Entry summary declaration approved\"},{\"E218\":\"ATA full container at warehouse\"}, {\"E273\":\"Temperature read\"}, {\"E999\":\"Other Event - Shock measured\"}]');
  sShipmentEvents.push('[{\"E268\":\"Full container picked up from warehouse\"},{\"E325\":\"Container seal inspected\"}, {\"E240\":\"Seal removed\"},{\"E213\":\"Container tracking ended\"}]');
  
}
//////////////////////////////
/*
function setTitles() {
  if (urlParams.industry == "AUTO")
  {
    alert("In here");
    $("#subassemblytitle").text(sAutoLocationDescs[0]);
    $("#producttitle").text(sAutoLocationDescs[1]);
    $("#packagingtitle").text(sAutoLocationDescs[2]);
  }
}
*/
////////////////////////////////
function populateProductBatches() {
   var sBatchIds = [];
   var productbatches;
   $("#packagebatchid").empty();
   //$('#orderslist').append('<thead><tr><th>  </th><th>Order#</th><th>Customer</th> <th>Order Type </th> <th>Description</th><th>Batch size</th><th>Received Date</th><th>Committed Date</th><th>Shipped Date</th><th>Shipped Batches</th><th>Shipment Status</th></tr></thead>');
   //$('#orderslist').append('<thead><tr><th>Track</th><th>Order#</th><th>Customer</th><th>Description</th><th>Committed Date</th><th>Delivery Location</th><th>Shipped Date</th><th>Shipment Status</th><th>Track</th></tr></thead>');

    //alert('inside loadOrders');
    var jsonString = '{"jsonrpc":"2.0","method":"query","params":{"type":1,"chaincodeID":{"name":"';
    jsonString+=sConfigDataJSON.configdata.chaincodeid+'"},"ctorMsg":{"function":"readAllAssetsProduct","args":';
    jsonString+='["{\\\"filter\\\":{\\\"match\\\":\\\"all\\\",\\\"select\\\":{\\\"0\\\":';
    jsonString+='{\\\"qprop\\\":\\\"assetstate.product.industryType\\\",\\\"value\\\":\\\"'+urlParams.industry+'\\\"},';
    jsonString+='\\\"1\\\":{\\\"qprop\\\":\\\"assetstate.product.makerId\\\",\\\"value\\\":\\\"'+urlParams.makerId+'\\\"}, ';
    jsonString+='\\\"2\\\":{\\\"qprop\\\":\\\"assetstate.product.productStatus\\\",\\\"value\\\":\\\"New\\\"}, ';
    jsonString+='\\\"3\\\":{\\\"qprop\\\":\\\"assetstate.product.productType\\\",\\\"value\\\":\\\"1\\\"}}}}"]},';
    jsonString+='"secureContext":"'+sConfigDataJSON.configdata.seccontext+'"},"id":1234}';
   
   //alert("Orders query: " +jsonString);

  $.ajax({
      type: "POST",
      url: sConfigDataJSON.configdata.apihostandport+'/chaincode',
      data: jsonString,
      dataType:"json",
      success: function(data, textStatus, jqXHR)
      {
        //alert(JSON.stringify(data));
        productbatches = $.parseJSON(data.result.message);
        sProductData = productbatches;
        $.each(productbatches, function(i, item) {
          sthisBatchId = item.assetstate.product.productBatchId;
            if (i == 0) {
              sBatchIds.push(sthisBatchId);
              $('#packagebatchid').append('<option selected> --Select-- </option>');
              $('#packagebatchid').append('<option>'+sthisBatchId+'</option>');
            } else {
              if(sBatchIds.indexOf(sthisBatchId) == -1) {
                sBatchIds.push(sthisBatchId);
                $('#packagebatchid').append('<option>'+sthisBatchId+'</option>');
              }
            }
        });
        //alert('success '+supplybatchId);
      },
      error: function (jqXHR, textStatus, errorThrown)
      {
        console.log("Error updating supply record" + errorThrown);
      }
  });
  
}
function populateSellers() {
   $("#packagesellername").empty();
   
    var jsonString = '{"jsonrpc":"2.0","method":"query","params":{"type":1,"chaincodeID":{"name":"';
    jsonString+=sConfigDataJSON.configdata.chaincodeid+'"},"ctorMsg":{"function":"readAllParticipantsSeller","args":';
    jsonString+='["{\\\"filter\\\":{\\\"match\\\":\\\"all\\\",\\\"select\\\":{\\\"0\\\":';
    jsonString+='{\\\"qprop\\\":\\\"assetstate.seller.industryType\\\",\\\"value\\\":\\\"'+urlParams.industry+'\\\"}}}}"]},';
    jsonString+='"secureContext":"'+sConfigDataJSON.configdata.seccontext+'"},"id":1234}';
   
   //alert("Orders query: " +jsonString);

  $.ajax({
      type: "POST",
      url: sConfigDataJSON.configdata.apihostandport+'/chaincode',
      data: jsonString,
      dataType:"json",
      success: function(data, textStatus, jqXHR)
      {
        //alert(JSON.stringify(data));
        sellers = $.parseJSON(data.result.message);
        sSellerData = sellers;
        $.each(sellers, function(i, item) {
          sthisSellerName = item.assetstate.seller.sellerAddress.name;
            if (i == 0) {
              $('#packagesellername').append('<option selected> --Select-- </option>');
            } 
            $('#packagesellername').append('<option>'+sthisSellerName+'</option>');
        });
        //alert('sSellerData '+sSellerData.toString());
      },
      error: function (jqXHR, textStatus, errorThrown)
      {
        console.log("Error updating supply record" + errorThrown);
      }
  });
  
}
/////////////////////////////
  function populatePackageDropdowns() {
    populateProductBatches();
    populateSellers();
  }
  /////////////////////////////
function populateSellerOrders(sSellerID) {
  $("#packagesellerorderid").empty();
   
    var jsonString = '{"jsonrpc":"2.0","method":"query","params":{"type":1,"chaincodeID":{"name":"';
    jsonString+=sConfigDataJSON.configdata.chaincodeid+'"},"ctorMsg":{"function":"readAllAssetsOrder","args":';
    jsonString+='["{\\\"filter\\\":{\\\"match\\\":\\\"all\\\",\\\"select\\\":{\\\"0\\\":';
    jsonString+='{\\\"qprop\\\":\\\"assetstate.order.industryType\\\",\\\"value\\\":\\\"'+urlParams.industry+'\\\"},';
    jsonString+='\\\"1\\\":{\\\"qprop\\\":\\\"assetstate.order.orderFulfiller.Id\\\",\\\"value\\\":\\\"'+urlParams.makerId+'\\\"},';
    jsonString+='\\\"2\\\":{\\\"qprop\\\":\\\"assetstate.order.orderIssuer.oderIssuerId\\\",\\\"value\\\":\\\"'+sSellerID+'\\\"},';
    jsonString+='\\\"3\\\":{\\\"qprop\\\":\\\"assetstate.order.orderStatus\\\",\\\"value\\\":\\\"New\\\"}}}}"]},';
    jsonString+='"secureContext":"'+sConfigDataJSON.configdata.seccontext+'"},"id":1234}';
   
   //alert("Orders query: " +jsonString);
   $.ajax({
      type: "POST",
      url: sConfigDataJSON.configdata.apihostandport+'/chaincode',
      data: jsonString,
      dataType:"json",
      success: function(data, textStatus, jqXHR)
      {
        //alert(JSON.stringify(data));
        orders = $.parseJSON(data.result.message);
        sOrderData = orders;
        $.each(orders, function(i, item) {
          sthisOrderId = item.assetstate.order.orderId;
            if (i == 0) {
              $('#packagesellerorderid').append('<option selected> --Select-- </option>');
            } 
            $('#packagesellerorderid').append('<option>'+sthisOrderId+'</option>');
        });
        //alert('sSellerData '+sSellerData.toString());
      },
      error: function (jqXHR, textStatus, errorThrown)
      {
        console.log("Error populating seller order" + errorThrown);
      }
  });
}
//////////////////////////////
function shipProducts() {
  var sBatchId = $("#packagebatchid").val();
  var sSellerId = $("#packagesellerid").val();
  var sToday = new Date().toJSON().slice(0,10).replace(/-/g,'/');
  var sChaincodeId = sConfigDataJSON.configdata.chaincodeid;
  var sSecureContext = sConfigDataJSON.configdata.seccontext;
  var sUrl = sConfigDataJSON.configdata.apihostandport+'/chaincode';
  $.each(sProductData, function(i, item) {
    if (sBatchId == item.assetstate.product.productBatchId) {
      // Update product status to Shipped
      sProductId = item.assetstate.product.productId;
      sProductSchemaId = item.assetstate.product.productSchemaId;
      var jsonString = '{ "jsonrpc": "2.0","method": "invoke","params": {"type": 1,"chaincodeID": ';
      jsonString+='{"name": "'+ sChaincodeId+ '"}, "ctorMsg": { "function": "updateAssetProduct" ';
      jsonString+=',"args":["{\\\"product\\\":{\\\"industryType\\\":\\\"'+urlParams.industry+'\\\",';
      jsonString+='\\\"productId\\\":\\\"'+sProductId+'\\\",\\\"productSchemaId\\\":\\\"'+sProductSchemaId;
      jsonString+='\\\",\\\"sellerId\\\":\\\"'+sSellerId+'\\\", \\\"shippedDate\\\":\\\"'+sToday;
      jsonString+='\\\", \\\"productStatus\\\":\\\"Shipped\\\"}}"]},"secureContext":"'+sSecureContext+'"},"id":5}';
      //alert('jsonString is '+jsonString) ;
      $.ajax({
              type: "POST",
              url: sUrl,
              data: jsonString,
              dataType:"json",
              success: function(data, textStatus, jqXHR)
              {
                console.log(JSON.stringify(data));
                alert('successfully shipped to dealer');
                $("#packagebatchid").val("--Select--");
                $("#packagesellername").val("--Select--");
                $("#packagesellerorderid").val("--Select--");
                $("#packagedestination").val("");
                $("#packagedestinationlatlong").val("");

              },
              error: function (jqXHR, textStatus, errorThrown)
              {
                console.log("Error shipping product to seller" + errorThrown);
              }
          });
    }
  });
}
//////////////////////////////
function clearPanel(sAggrLevel) {
  if (sAggrLevel=="0") {
    alert("Component creation successful");
    // We need to clear the Component Panel
    $("#productschemaid").val("--Select--");
    $("#productprodcode").val("");
    $("#productproddesc").val("");
    $("#assemblycount").val("1");
    $("#assemblyschemadefn").val("");
    //$("#assemblyprodids").val("");
    //$("#assemblybatchid").val("");
    $("#assemblyoderid").val("");
    $("#assemblydestination").val("");
  } else {
    alert("Product creation successful");
    // We need to clear the Product Panel
    $("#assemblyschemaid").val("--Select--");
    $("#assemblyprodcode").val("");
    $("#assemblyproddesc").val("");
    $("#productcount").val("1");
    $("#productschemadefn").val("");
    $("#productprodids").val("");
    //$("#productbatchid").val("");
    //$("#productoderid").val("");
    $("#productdestination").val("");
  }
}

   