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
                $content.find('.answer').html('Right result:&nbsp;' + JSON.stringify(rightResult));
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
            canvas.createCanvas(checkioInput);

            if (result_addon[1]) {
                canvas.animateCanvas(userResult, result_addon[0]);
            }


            this_e.setAnimationHeight($content.height() + 60);

        });

       

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

        function AmuletCanvas(dom) {
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

            this.createCanvas = function(start) {
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


                for (var i = 1; i <= 3; i++){
                    var lev = paper.set();
                    lev.push(paper.path(format("M{0},{1}V{2}", cx, cx - radius, cx - radius - i * unit)).attr(attrLever));
                    lev.push(paper.circle(cx, cx - radius - i * unit, radius / 5).attr(attrLeverCircle));
                    lev.rotate(start[i-1], cx, cx);
                    lev.angle = start[i - 1];
                    levers.push(lev);
                }

                mainCircle = paper.circle(radius * 3, radius * 3, radius).attr(attrEtalonCircle);

            };

            this.animateCanvas = function(userAngles, recolor) {
                var delay = 20;

                var i = 0;

                var angles = [Math.abs(userAngles[0]), Math.abs(userAngles[1]), Math.abs(userAngles[2])];

                var anglesSign = [angles[0] / userAngles[0], angles[1] / userAngles[1], angles[2] / userAngles[2]];

                (function rotating() {
                    if (angles[i] <= 0) {
                        i++;
                        if (i >= 3) {
                            if (recolor) {
                                for (var x = 0; x < 3; x++) {
                                  levers[x].animate({"stroke": colorOrange4, "fill": colorOrange4}, 200);
                                }
                                mainCircle.animate({"stroke": colorOrange4}, 200);
                            }
                            return false;
                        }
                        setTimeout(rotating, 200);
                        return false;
                    }


                    var j = (i + 1) % 3,
                        k = (i + 2) % 3;

//                    for (var x = 0; x < 3; x++) {
//                        if (levers[x].angle === etalon[x] || 360 - levers[x].angle === etalon[x]) {
//                            levers[x].attr({"stroke": colorOrange4, "fill": colorOrange4});
//                        }
//                        else {
//                            levers[x].attr({"stroke": colorBlue2, "fill": colorBlue2});
//                        }
//                    }

                    var sign = anglesSign[i];
                    levers[i].angle += sign;
                    levers[j].angle += 2 * sign;
                    levers[k].angle += 3 * sign;
                    angles[i] -= 1;
                    levers[j].animate({"transform": format("r{0},{1},{1}", levers[j].angle, cx)}, delay);
                    levers[k].animate({"transform": format("r{0},{1},{1}", levers[k].angle, cx)}, delay);
                    levers[i].animate({"transform": format("r{0},{1},{1}", levers[i].angle, cx)}, delay,
                        callback=rotating);
                })();

            }

        }

    }
);
