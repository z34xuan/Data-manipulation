
var DATAC =  {
    url: "http://www.aulence.com/project/dataCommand/json/goodsData.json",
    loading: '<div class="popBox">\
              <div class="maskLayer"></div>\
              <div class="loadingAnim"></div>\
              </div>'
}

$(function() {
    $("#loadData").click(function() {
        $.getJSON(DATAC.url, function(data) {
            var notCont = $("#dataTable tbody").children().length == 0;
            if(notCont) {
                $("body").append(DATAC.loading);
            }
            setTimeout(function() {
                $("#dataTable tbody").html("");
                getDataInHTML(data);
                $(".popBox").fadeOut(600, function() {
                    $(this).remove();
                });
            }, 600);
        });
    });

    $(".ckb-all").change(function() {
        ckdAllInput(this);
    });

    $(document).on("change", "#dataTable tbody input:checkbox", function() {
        dataTrCkd(this);
    });

    $(document).on("click", "#dataTable tbody .delete", function() {
        deleteConfirm("single", this);
    });

    $("#delCkdData").click(function() {
        deleteConfirm("multiple", this);
    });

    sortOrder(0);
    sortOrder(1);
    sortOrder(2);
    sortOrder(3);
});

function getDataInHTML(jsonData) {
    var dataContent = $("#dataTable tbody"),
        data_len = dataContent.children("tr").length,
        jsonObj_len = jsonData.length;
    if(data_len > 0) {
        return false;
    }
    else {
        for(var i = 0; i < jsonObj_len; i++) {
            dataContent.append("<tr></tr>");
            for(x in jsonData[i]) {
                if(x == "qualityDete") {
                    dataContent.children("tr").eq(i).append(
                        '<td>' + jsonData[i][x] + '</td>'
                    );
                }
                else if(x == "price") {
                    dataContent.children("tr").eq(i).append(
                        '<td>' + parseFloat(jsonData[i][x]).toFixed(2) + '</td>'
                    );
                }
                else if(x == "command") {
                    dataContent.children("tr").eq(i).append(
                        '<td class="ctrl">' + jsonData[i][x] + '</td>'
                    );
                }
                else {
                    dataContent.children("tr").eq(i).append(
                        '<td>' + jsonData[i][x] + '</td>'
                    );
                }
            }
        }
        var allCkb = $(".ckb-all input:checkbox");
        allCkb.prop("disabled", false).css("cursor", "pointer");
        allCkb[0].indeterminate = false;
    }
}

function ckdAllInput(ident) {
    var ckd = $(ident).children("input").prop("checked"),
        bodyCkb = $("#dataTable tbody input:checkbox");
    if(ckd) {
        bodyCkb.prop("checked", true);
    }
    else {
        bodyCkb.prop("checked", false);
    }
}

function dataTrCkd(ident) {
    var ckbAll = $(".ckb-all input:checkbox"),
        tr = $("#dataTable tbody").children(),
        tr_len = tr.length,
        ckdCount = 0;
    for(var i = 0; i < tr_len; i++) {
        if((tr.eq(i).find("input:checkbox").prop("checked")) == true) {
            ckdCount++;
        }
    }
    if(ckdCount == 0) {
        ckbAll[0].indeterminate = false;
        ckbAll.prop("checked", false);
    }
    else if(ckdCount < tr_len) {
        ckbAll[0].indeterminate = true;
    }
    else {
        ckbAll[0].indeterminate = false;
        ckbAll.prop("checked", true);
    }
}


function deleteConfirm(deleteType, ident) {
    if(deleteType == "single") {
        $(ident).parents("tr").addClass("holdCommand");
        popBox({
            content: "",
            confirm: function() {
                $(".holdCommand").fadeOut(300, function() {
                    $(this).remove();
                    dataTrCkd(ident);
                    var data_len = $("#dataTable tbody").children().length;
                    if(data_len == 0) {
                        $("#dataTable thead i.arrow").removeClass("up down");
                    }
                });
            },
            cancel: function() {
                $(".holdCommand").removeClass("holdCommand");
            }
        });
    }
    else if(deleteType == "multiple") {
        popBox({
            content: "",
            confirm: function() {
                var ckd_tr = $("#dataTable tbody input:checkbox:checked").parents("tr");
                ckd_tr.fadeOut(300, function() {
                    $(this).remove();
                    dataTrCkd(ident)
                    var data_len = $("#dataTable tbody").children().length;
                    if(data_len == 0) {
                        $("#dataTable thead i.arrow").removeClass("up down");
                    }
                });
            }
        });
    }
    else {
        popBox({});
        $(".popBox").find("#cancel").remove();
    }
}

function popBox(param) {
    param.content = (param.content === undefined ? "" : param.content);
    param.confirm = (param.confirm === undefined ? function(){} : param.confirm);
    param.cancel = (param.cancel === undefined ? function(){} : param.cancel);
    $("body").append(
        '<div class="popBox">' +
        '<div class="maskLayer"></div>' +
        '<div class="popBox-main">' +
        '<div class="popBox-mesg">' + param.content + '</div>' +
        '<div class="popBox-btnGroup">' +
        '<button id="confirm" type="button">确定</button>' +
        '<button id="cancel" type="button">取消</button>' +
        '</div></div></div>'
    );
    var pop = $(".popBox .popBox-main"),
        pop_ow = pop.outerWidth(),
        pop_oh = pop.outerHeight();
    pop.css({
        "marginLeft": -(pop_ow / 2) + "px",
        "marginTop": -(pop_oh / 2) + "px"
    });
    pop.fadeIn(600);
    $(".popBox #confirm").click(function() {
        param.confirm();
        $(this).parents(".popBox").fadeOut(600, function() {
            $(this).remove();
        });
    });
    $(".popBox #cancel").click(function() {
        param.cancel();
        $(this).parents(".popBox").fadeOut(600, function() {
            $(this).remove();
        });
    });
}

function sortOrder(idx) {
    $("#dataTable thead i").eq(idx).click(function() {
        var hasData = $("#dataTable tbody").children().length;
        if(!hasData) {
            return;
        }
        var isNormal = $(this).hasClass("normal"),
            isAscending = $(this).hasClass("up"),
            isDescending = $(this).hasClass("down");
        if(isNormal || isDescending) {
            $(this).removeClass("normal down").addClass("up")
            .parent().siblings().children("i.arrow").removeClass("up down").addClass("normal");
            if(idx == 0) {
                $.getJSON(DATAC.url,function(data) {
                    data.sort(function(obj1,obj2) {
                        var num1 = 0, num2 = 0;
                        num1 = obj1.id.slice(obj1.id.lastIndexOf("\-") + 1);
                        num2 = obj2.id.slice(obj2.id.lastIndexOf("\-") + 1);
                        return num1 - num2;
                    });
                    loadData(data);
                });
            }
            else if(idx == 1) {
                $.getJSON(DATAC.url,function(data) {
                    data.sort(function(obj1,obj2) {
                        var num1 = 0, num2 = 0;
                        num1 = obj1.manufacDate.replace(/\-/g, "");
                        num2 = obj2.manufacDate.replace(/\-/g, "");
                        return num1 - num2;
                    });
                    loadData(data);
                });
            }
            else if(idx == 2) {
                $.getJSON(DATAC.url,function(data) {
                    data.sort(function(obj1,obj2) {
                        var num1 = 0, num2 = 0;
                        num1 = obj1.stockDete.replace(/\-/g, "");
                        num2 = obj2.stockDete.replace(/\-/g, "");
                        return num1 - num2;
                    });
                    loadData(data);
                });
            }
            else if(idx == 3) {
                $.getJSON(DATAC.url,function(data) {
                    data.sort(function(obj1,obj2) {
                        var num1 = 0, num2 = 0;
                        num1 = obj1.price;
                        num2 = obj2.price;
                        return num1 - num2;
                    });
                    loadData(data);
                });
            }
            else {
                return;
            }
        }
        else if(isAscending) {
            $(this).removeClass("up").addClass("down")
            .parent().siblings().children("i.arrow").removeClass("up down").addClass("normal");
            if(idx == 0) {
                $.getJSON(DATAC.url,function(data) {
                    data.sort(function(obj1,obj2) {
                        var num1 = 0, num2 = 0;
                        num1 = obj1.id.slice(obj1.id.lastIndexOf("\-") + 1);
                        num2 = obj2.id.slice(obj2.id.lastIndexOf("\-") + 1);
                        return num1 - num2;
                    });
                    loadData(data, "rev");
                });
            }
            else if(idx == 1) {
                $.getJSON(DATAC.url,function(data) {
                    data.sort(function(obj1,obj2) {
                        var num1 = 0, num2 = 0;
                        num1 = obj1.manufacDate.replace(/\-/g, "");
                        num2 = obj2.manufacDate.replace(/\-/g, "");
                        return num1 - num2;
                    });
                    loadData(data, "rev");
                });
            }
            else if(idx == 2) {
                $.getJSON(DATAC.url,function(data) {
                    data.sort(function(obj1,obj2) {
                        var num1 = 0, num2 = 0;
                        num1 = obj1.stockDete.replace(/\-/g, "");
                        num2 = obj2.stockDete.replace(/\-/g, "");
                        return num1 - num2;
                    });
                    loadData(data, "rev");
                });
            }
            else if(idx == 3) {
                $.getJSON(DATAC.url,function(data) {
                    data.sort(function(obj1,obj2) {
                        var num1 = 0, num2 = 0;
                        num1 = obj1.price;
                        num2 = obj2.price;
                        return num1 - num2;
                    });
                    loadData(data, "rev");
                });
            }
            else {
                return;
            }
        }
        function loadData(orgData, type) {
            if(type == "rev") {
                orgData.reverse();
            }
            $("body").append(DATAC.loading);
            setTimeout(function() {
                $("#dataTable tbody").html("");
                getDataInHTML(orgData);
                $(".popBox").fadeOut(600, function() {
                    $(this).remove();
                });
            }, 600);
        }
    });
}




















