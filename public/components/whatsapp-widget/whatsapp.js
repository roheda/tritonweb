document.body.onload = function () {

    var e = "required", t = document.getElementById("form-contact-widget");

    function a(t) {

        if (!t.required) return !0;

        switch ((t.classList.remove(e), t.type)) {

            case "email":
                if (!/^\S+@\S+$/.test(t.value)) return t.classList.add(e), !1;
                break;

            default:
                if ("" == t.value || null == t.value) return t.classList.add(e), !1;
        }

        return !0;
    }

    (document.getElementById("form-contact-widget").onsubmit = function () {

        var e = t.querySelectorAll("[data-message]");
        var o = t.getAttribute("action");

        document.getElementById("form-contact-widget").removeAttribute("action");

        for (var r = "https://wa.me/" + o + "?text=", n = !0, s = 0; s < e.length; s++) {
            var c = e[s];
            a(c) || (n = !1);
            var i = c.getAttribute("data-message");
            r += i.replace(/^./, i[0].toUpperCase()) + ": " + c.value + "%0A";
        }

        if (n) {

            $("input.chat-send").attr("disabled", !0), (document.getElementById("sendGuats").disabled = !0), window.open(r, "_blank");
            
            var u = this;
            return (
                setTimeout(function () {
                    u.submit();
                }, 1e3),
                !1
            );
        }
    })
    // $.ajax({
    //     url: "https://script.google.com/macros/s/AKfycbz3CCefH_vusIwDE6SFIfyBZs0WxfIzhqEw4JGufoz3lpZm2xA/exec",
    //     method: "GET",
    //     dataType: "json",
    //     data: { Name: "Proy", Last_Name: "num", Email: "2", Url: window.location.href, Project: "Saria", Submit_Date: new Date() },
    //     success: function (e) {
    //         console.log("success");
    //     },
    //     error: function (e) {
    //         console.log("Error");
    //     },
    // });
};
