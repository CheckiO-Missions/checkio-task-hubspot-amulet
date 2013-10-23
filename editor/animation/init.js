//Dont change it
requirejs(['ext_editor_1', 'jquery_190', 'raphael_210'],
    function (ext, $, TableComponent) {

        var cur_slide = {};

        ext.set_start_game(function (this_e) {
        });

        ext.set_process_in(function (this_e, data) {
            cur_slide["in"] = data[0];
        });

        ext.set_process_out(function (this_e, data) {
            cur_slide["out"] = data[0];
        });

        ext.set_process_ext(function (this_e, data) {
            cur_slide.ext = data;
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_process_err(function (this_e, data) {
            cur_slide['error'] = data[0];
            this_e.addAnimationSlide(cur_slide);
            cur_slide = {};
        });

        ext.set_animate_success_slide(function (this_e, options) {
            var $h = $(this_e.setHtmlSlide('<div class="animation-success"><div></div></div>'));
            this_e.setAnimationHeight(115);
        });

        ext.set_animate_slide(function (this_e, data, options) {
            var $content = $(this_e.setHtmlSlide(ext.get_template('animation'))).find('.animation-content');
            if (!data) {
                console.log("data is undefined");
                return false;
            }

            var checkioInput = data.in;

            if (data.error) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.output').html(data.error.replace(/\n/g, ","));

                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
                $content.find('.answer').remove();
                $content.find('.explanation').remove();
                this_e.setAnimationHeight($content.height() + 60);
                return false;
            }

            var rightResult = data.ext["answer"];
            var userResult = data.out;
            var result = data.ext["result"];
            var result_addon = data.ext["result_addon"];


            //if you need additional info from tests (if exists)
            var explanation = data.ext["explanation"];

            $content.find('.output').html('&nbsp;Your result:&nbsp;' + JSON.stringify(userResult));

            if (!result) {
                $content.find('.call').html('Fail: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').html(result_addon[1]);
                $content.find('.answer').addClass('error');
                $content.find('.output').addClass('error');
                $content.find('.call').addClass('error');
            }
            else {
                $content.find('.call').html('Pass: checkio(' + JSON.stringify(checkioInput) + ')');
                $content.find('.answer').remove();
            }
            //Dont change the code before it

            var canvas = new AmuletCanvas($content.find(".explanation")[0]);
            canvas.createCanvas([0, 0, 0]);

            if (result_addon[0]) {
                canvas.animateCanvas(checkioInput, userResult, result);
            }


            this_e.setAnimationHeight($content.height() + 60);

        });

        var $tryit;
        var tCanvas;
        var matrixData = [[1, 1, 1], [1,1,1], [1,1,1]];
        var tButton;

        ext.set_console_process_ret(function (this_e, ret) {
            try {
                ret = JSON.parse(ret);
            }
            catch(err) {
                $tryit.find(".checkio-result-in").html(JSON.stringify(ret));
                tButton.attr("disabled", false);
                return false
            }
            if (Array.isArray(ret) && ret.length == 3 && ret.every(function(x){return !isNaN(x)})) {
                tCanvas.animateCanvas(matrixData, ret, false, tButton);
            }
            else {
                tButton.attr("disabled", false);
            }
            $tryit.find(".checkio-result-in").html(JSON.stringify(ret));
        });

        ext.set_generate_animation_panel(function (this_e) {

                $tryit = $(this_e.setHtmlTryIt(ext.get_template('tryit')));
                tButton = $tryit.find(".bn-check");
                tCanvas = new AmuletCanvas($tryit.find(".tryit-canvas")[0]);
                tCanvas.createCanvas([0, 0, 0]);
                var inputs = $tryit.find("table.matrix-in input");
                inputs.keyup(function (e) {
                    var $this = $(this);
                    var value = $this.val();
                    if (value.length > 2) {
                        value = value.slice(0, 2);
                        $this.val(value);
                    }
                    if (isNaN(value)) {
                        value = "1";
                        $this.val(value);
                    }
                    if (value.indexOf(".") !== -1) {
                        value = value.slice(0, value.indexOf("."));
                        $this.val(value);
                    }
                });
                inputs.blur(function (e) {
                    var $this = $(this);
                    var value = $this.val();
                    if (value === "") {
                        $this.val(1);
                    }
                });

                tButton.click(function(e){

                    inputs.each(function(index){
                        var $this = $(this);
                        matrixData[Math.floor(index / 3)][index % 3] = Number($this.val());
                    });
                    tButton.attr("disabled", true);
                    tCanvas.resetCanvas();
                    this_e.sendToConsoleCheckiO(matrixData);
                    e.stopPropagation();
                    return false;
                });
            }
        );


        function AmuletCanvas(dom) {
            var colorOrange4 = "#F0801A";
            var colorOrange3 = "#FA8F00";
            var colorOrange2 = "#FAA600";
            var colorOrange1 = "#FABA00";

            var colorBlue4 = "#294270";
            var colorBlue3 = "#006CA9";
            var colorBlue2 = "#65A1CF";
            var colorBlue1 = "#8FC7ED";

            var colorGrey4 = "#737370";
            var colorGrey3 = "#9D9E9E";
            var colorGrey2 = "#C5C6C6";
            var colorGrey1 = "#EBEDED";

            var colorWhite = "#FFFFFF";

            var radius = 50;
            var unit = Math.round(2 * radius / 3);
            var etalon = [0, 225, 315];
            var format = Raphael.format;
            var fullSize = radius * 6;
            var cx = Math.round(fullSize / 2);


            var paper = Raphael(dom, radius * 6, radius * 6, 0, 0);
            var shadow = paper.set();
            var levers = paper.set();
            var mainCircle;

            var attrEtalonCircle = {"stroke": colorBlue2, "stroke-width": radius / 2};
            var attrLeverSh = {"stroke": colorGrey2, "stroke-width": radius / 3};
            var attrLever = {"stroke": colorBlue2, "stroke-width": radius / 3};
            var attrLeverCircleSh = {"stroke": colorGrey2, "stroke-width": radius / 5, "fill": colorGrey2};
            var attrLeverCircle = {"stroke": colorBlue2, "stroke-width": radius / 5, "fill": colorBlue2};
            var attrAxis = {"stroke": colorGrey4, "opacity": 0.3};

            this.createCanvas = function (start) {
                paper.path(format("M{0},0V{1}", radius * 3, fullSize)).attr(attrAxis);
                paper.path(format("M0,{0}H{1}", radius * 3, fullSize)).attr(attrAxis);
                paper.path(format("M0,{0}L{0},0", fullSize)).attr(attrAxis);
                paper.path(format("M0,0L{0},{0}", fullSize)).attr(attrAxis);
                //levers shadows
                shadow.push(paper.path(format("M{0},{1}V{2}", cx, cx - radius, cx - radius - unit)).attr(attrLeverSh));
                shadow.push(paper.path(format("M{0},{1}V{2}", cx, cx - radius, cx - radius - 2 * unit)).attr(attrLeverSh).rotate(225, cx, cx));
                shadow.push(paper.path(format("M{0},{1}V{2}", cx, cx - radius, cx - radius - 3 * unit)).attr(attrLeverSh).rotate(315, cx, cx));
                shadow.push(paper.circle(cx, cx - radius - unit, radius / 5).attr(attrLeverCircleSh));
                shadow.push(paper.circle(cx, cx - radius - 2 * unit, radius / 5).attr(attrLeverCircleSh).rotate(225, cx, cx));
                shadow.push(paper.circle(cx, cx - radius - 3 * unit, radius / 5).attr(attrLeverCircleSh).rotate(315, cx, cx));
//                shadow.attr("opacity", 0.5);


                for (var i = 1; i <= 3; i++) {
                    var lev = paper.set();
                    lev.push(paper.path(format("M{0},{1}V{2}", cx, cx - radius, cx - radius - i * unit)).attr(attrLever));
                    lev.push(paper.circle(cx, cx - radius - i * unit, radius / 5).attr(attrLeverCircle));
                    lev.rotate(start[i - 1], cx, cx);
                    lev.angle = start[i - 1];
                    levers.push(lev);
                }

                mainCircle = paper.circle(radius * 3, radius * 3, radius).attr(attrEtalonCircle);

            };

            this.animateCanvas = function (matrix, userAngles, recolor, button) {
                function mod360 (n) {
                    return ((n%360)+360)%360;
                }


                var delay = 15;

                var i = 0;

                var angles = [Math.abs(userAngles[0]), Math.abs(userAngles[1]), Math.abs(userAngles[2])];

                var anglesSign = [angles[0] / userAngles[0], angles[1] / userAngles[1], angles[2] / userAngles[2]];

                var etalon = function(ar) {
                    return mod360(ar[0].angle) === 0 && mod360(ar[1].angle) === 225 && mod360(ar[2].angle) === 315;
                };

                function rotating() {
                    if (angles[i] <= 0) {
                        i++;
                        if (i >= 3) {
                            if (recolor || etalon(levers)) {
                                levers.animate({"stroke": colorOrange1, "fill": colorOrange1}, 200);
                                mainCircle.animate({"stroke": colorOrange1}, 200,
                                    callback = function () {
                                        levers.animate({"stroke": colorOrange4, "fill": colorOrange4}, 200);
                                        mainCircle.animate({"stroke": colorOrange4}, 200);
                                    });
                            }
                            if (button) {
                                button.attr("disabled", false);
                            }
                            return false;
                        }
                        setTimeout(rotating, 200);
                        return false;
                    }

                    var j = (i + 1) % 3,
                        k = (i + 2) % 3;

                    var sign = anglesSign[i];
                    levers[i].angle += sign;
                    levers[j].angle += matrix[i][j] * sign;
                    levers[k].angle += matrix[i][k] * sign;
                    angles[i] -= 1;
                    levers[j].animate({"transform": format("r{0},{1},{1}", levers[j].angle, cx)}, delay);
                    levers[k].animate({"transform": format("r{0},{1},{1}", levers[k].angle, cx)}, delay);
                    levers[i].animate({"transform": format("r{0},{1},{1}", levers[i].angle, cx)}, delay,
                        callback = rotating);
                }

                setTimeout(rotating, 500);

            };

            this.resetCanvas = function() {
                for (var i = 0; i < 3; i++){
                    levers[i].angle = 0;
                    levers[i].animate({"transform": format("r{0},{1},{1}", levers[i].angle, cx)}, 300);
                }
                levers.animate({"stroke": colorBlue1, "fill": colorBlue1}, 200);
                mainCircle.animate({"stroke": colorBlue1}, 200,
                    callback = function () {
                        levers.animate({"stroke": colorBlue2, "fill": colorBlue2}, 200);
                        mainCircle.animate({"stroke": colorBlue2}, 200);
                    });
            }


        }

    }
);
