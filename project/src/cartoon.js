/**
 * 全局指针 时间线
 */
var tl

const cartoon_theme = [
    'hsl(110, 66%, 51%)', // fade green
    'hsl(110, 66%, 51%)', // norml green
    'hsl(133, 90%, 60%)'  // light green
]
const cartoon_theme2 = [
    'hsl(47, 61%, 82%)', // fade yellow
    'hsl(47, 85%, 70%)', // norml yellow
    'hsl(55, 91%, 68%)'  // light yellow
]

/** @return 对象 位于动画层上的动画专用的图 */
function cartoon_init(g_ori = g) {
    var layer_cartoon = new Konva.Layer()
    layer_cartoon.id('layer_cartoon')

    tl = new TimelineMax({
        onStart: () => {
            layer.hide();
        },
        onComplete: () => {
            layer_cartoon.destroy();
            layer.show();
            layer.batchDraw();
            tl = null
        },
    });

    let g_cartoon = g_ori.copy_graph()
    g_cartoon.visualization(layer_cartoon)
    
    stage.add(layer_cartoon);
    layer_cartoon.draw()

    console.log(layer_cartoon);

    // 关闭拖动效果
    let groups = layer_cartoon.find('Group');
    groups.forEach(element => {
        element.draggable(!element.draggable());
    });

    g_cartoon.cartoon = true
    console.log(g_cartoon);
    return g_cartoon
}

function color_sel(color_type) {
    let color
    switch (color_type) {
        case 'default':
            color = theme
            break;
        case 'green':
            color = cartoon_theme
            break;
        case 'yellow':
            color = cartoon_theme2
            break;
    }
    return color
}

/** 改变颜色 */
function cartoon_change_color(v, timeline, g_lo, color = 'green') {
    if (!g_lo.cartoon) {
        return
    }

    let group_local = g_lo.get_group(v).children[0]
    timeline.add(
        TweenLite.to(group_local, 1, {
            konva: {
                fill: color_sel(color)[0],
            }
        })
    )
}
function cartoon_twinkle_color(v, timeline, g_lo, color = 'green') {
    let group_local = g_lo.get_group(v).children[0]
    timeline.add(
        TweenLite.to(group_local, 0.5, {
            konva: {
                fill: color_sel(color)[0],
            }
        })
    )
    timeline.add(
        TweenLite.to(group_local, 0.5, {
            konva: {
                fill: color_sel("default")[0],
            }
        })
    )
}
function cartoon_change_color_arrow(v, w, timeline, g_lo, color = 'green') {
    if (!g_lo.cartoon) {
        return
    }
    t = g_lo.get_arrow_to(v, w)
    console.log(t.id(), v, w);
    timeline.add(
        TweenLite.to(g_lo.get_arrow_to(v, w), 1, {
            konva: {
                fill: color_sel(color)[2],
                stroke: color_sel(color)[2],
            }
        })
    )
    if (g_lo.graph_type.is_undirected()) {
        timeline.add(
            TweenLite.to(g_lo.get_arrow_to(w, v), 0, {
                konva: {
                    fill: color_sel(color)[2],
                    stroke: color_sel(color)[2],
                }
            })
        )
    }
}
function cartoon_change_color_arrow_relax(s_to, v, w, timeline, g_lo) {
    if (!g_lo.cartoon) {
        return
    }
    if (s_to.edge(w) == nullnode) {
        cartoon_change_color_arrow(v, w, timeline, g_lo);
    }
    else {
        let e = s_to.edge(w)
        cartoon_change_color_arrow(e.v, e.w, timeline, g_lo, "default");
        cartoon_change_color_arrow(v, w, timeline, g_lo);
    }
}
function cartoon_change_color_edge(v, w, timeline, g_lo, color = 'green') {
    if (!g_lo.cartoon) {
        return
    }
    cartoon_change_color(v, timeline, g_lo, color)
    cartoon_change_color_arrow(v, w, timeline, g_lo, color)
    cartoon_change_color(w, timeline, g_lo, color)
}

/** 路径 */
function cartoon_path_to(list_lo, timeline, g_lo) {
    if (!g_lo.cartoon) {
        return
    }
    for (let i of list_lo.keys()) {
        if (i == list_lo.length - 1) {
            break
        }
        let v = list_lo[i]
        let w = list_lo[i+1]
        cartoon_change_color_edge(v, w, timeline, g_lo)
    }
}

/** 回调函数可视化 */
function cartoon_call(func, params, timeline, g_lo, time = "+=1") {
    if (!g_lo.cartoon) {
        return
    }
    timeline.call(func, params, g_lo, time)
}

/** 删除未变色的箭头图形 */
function cartoon_del_arrow_all(g_lo) {
    for (const arr of g_lo.get_all_arrow_list()) {
        if (arr.fill() == theme[2]) {
            arr.destroy()
        }
    }
    stage.batchDraw()
}

function cartoon_del_edge_all(g_lo) {
    for (const e of g_lo.get_edge_obj_all_list()) {
        g_lo.del_edge(e.v, e.w)
    }
}

/** 零效果动画 */
function cartoon_default_end(timeline, g_lo, times = 2) {
    if (!g_lo.cartoon) {
        return
    }
    let group_local = g_lo.get_group(g_lo.get_head_ver()).children[0]
    timeline.add(
        TweenLite.to(group_local, times, {
            konva: {
                radius: group_local.radius(),
            }
        })
    )
}

function local_cartoon_add_opacity(params, time, timeline, opa_val) {
    timeline.add(
        TweenLite.to(params, time, {
            konva: {
                opacity: opa_val
            }
        })
    )
}
/** 边的透明度 */
function cartoon_opacity_arrow(v, w, timeline, g_lo, visibie = false) {
    if (!g_lo.cartoon) {
        return
    }
    let opa_val = (visibie == false) ? 0 : 1
    local_cartoon_add_opacity(g_lo.get_arrow_to(v, w), 1, timeline, opa_val)
    local_cartoon_add_opacity(g_lo.get_label_to(v, w), 0, timeline, opa_val)
    if (g_lo.graph_type.is_undirected()) {
        local_cartoon_add_opacity(g_lo.get_arrow_to(w, v), 0, timeline, opa_val)
        local_cartoon_add_opacity(g_lo.get_label_to(w, v), 0, timeline, opa_val)
    }
}
function cartoon_opacity_arrow_all(timeline, g_lo, visibie = false) {
    if (!g_lo.cartoon) {
        return
    }
    let opa_val = (visibie == false) ? 0 : 1
    let arrow_local_list = []
    let label_local_list = []
    for (const e of g_lo.get_edge_obj_all_list(true)) {
        arrow_local_list.push(g_lo.get_arrow_to(e.v, e.w))
        label_local_list.push(g_lo.get_label_to(e.v, e.w))
        if (g_lo.graph_type.is_undirected()) arrow_local_list.push(g_lo.get_arrow_to(e.w, e.v))
        if (g_lo.graph_type.is_undirected()) arrow_local_list.push(g_lo.get_label_to(e.w, e.v))
    }
    local_cartoon_add_opacity(arrow_local_list, 1, timeline, opa_val)
    local_cartoon_add_opacity(label_local_list, 0, timeline, opa_val)
}
/** 标签的透明度 */
function cartoon_opacity_label(v, w, timeline, g_lo, visibie = false) {
    if (!g_lo.cartoon) {
        return
    }
    let opa_val = (visibie == false) ? 0 : 1
    local_cartoon_add_opacity(g_lo.get_label_to(v, w), 0, timeline, opa_val)
    if (g_lo.graph_type.is_undirected()) {
        local_cartoon_add_opacity(g_lo.get_label_to(w, v), 0, timeline, opa_val)
    }
}
function cartoon_opacity_label_s_to_v(v, timeline, g_lo, visibie = false) {
    if (!g_lo.cartoon) {
        return
    }
    let opa_val = (visibie == false) ? 0 : 1
    local_cartoon_add_opacity(g_lo.get_vals(v).s_to_list[0], 0, timeline, opa_val)
}

/** 创建距离标签
 *  @new g_lo.s_to_list */
function cartoon_create_label_s_to_list(s, g_lo) {
    let s_to = new D_Edge_Marked(g_lo, s)
    let in_layer = g_lo.get_group(g_lo.get_head_ver()).findAncestor('Layer')
    for (const [ver, node] of g_lo.adj_list.entries()) {
        let gr = get_group_current_xy(node.group)
        let rad = node.group.children[0].radius()
        let t = create_label(s_to.dist(ver), gr.x, gr.y + rad)
        t.getTag().fill(cartoon_theme2[0])
        Object.assign(node, {
            s_to_list: []
        })
        node.s_to_list.push(t)
        in_layer.add(t)
    }
    stage.batchDraw()
}
function cartoon_change_text_label_s_to_v_list(v, value, timeline, g_lo) {
    if (!g_lo.cartoon) {
        return
    }
    cartoon_call((info) => {
        g_lo.get_vals(v).s_to_list[0].getText().text(value);
    }, [''], timeline, g_lo)
    cartoon_default_end(timeline, g_lo, 1)
    
}