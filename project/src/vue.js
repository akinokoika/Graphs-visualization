/**
 * 全局指针 图
 */
var g

class Hinsert_Type {
    constructor(val) {
        this.info = val
    }
    get_typing() {
        if (this.info == true) {
            return "v_to_w"
        }
        if (this.info == false) {
            return "text"
        }
    }
    set_typing(type) {
        if (type == "v_to_w") {
            this.info = true
        }
        if (type == "text") {
            this.info = false
        }
    }
    hinsert_type_info_switch(type){
        switch (type) {
            case "v_to_w":
                this.set_typing("text")
                break;
            case "text":
                this.set_typing("v_to_w")
                break;
        }
    }
}
/** 输入, 初始化图 */ 
const handle_main = Vue.createApp({
    data() {
        return {
            v_info: '',
            w_info: '',
            weight_info: '',
            snum_type: '4',
            sel_status: true,
            line_info: '',
            hinsert_type_info: new Hinsert_Type(true)
        }
    },
    methods: {
        handle_hinsert_type_info(type){
            this.hinsert_type_info.hinsert_type_info_switch(type)
        },
        hinsert_v_to_w() {
            if (this.v_info == '' || this.w_info == '') {
                // 测试用例
                const vl = ['1','2','3','4']
                for (const key in vl) {
                    g.add_vertex(vl[key])
                }
                g.add_edge('2','1',10)
                g.add_edge('1','3',2)
                g.add_edge('3','2',5)
                g.add_edge('4','2',1)
            } else {
                g.add_vertex(this.v_info)
                g.add_vertex(this.w_info)
                g.add_edge(this.v_info, this.w_info, this.weight_info)
            }
        },
        hinsert_text() {
            let lines = this.line_info.trim().split(/\s+/)
            if (lines.length % 3 != 0) {
                return
            }
            let ver_list = new Set()
            weight_count = 1
            for (const val of lines) {
                if (weight_count == 3) {
                    weight_count = 1
                    continue
                }
                ver_list.add(val)
                weight_count += 1
            }
            for (const ver of [...ver_list]) {
                g.add_vertex(ver)
            }
            for (let i = 0; i < lines.length; i+=3) {
                let v = lines[i]
                let w = lines[i+1]
                let weight = new Big(lines[i+2]).toNumber()
                g.add_edge(v, w, weight)
            }
        },
        hinsert() {
            if (g === undefined) {
                g = new Graph(Number(this.snum_type))
                this.sel_status = false
            }
            switch (this.hinsert_type_info.get_typing()) {
                case "v_to_w":
                    this.hinsert_v_to_w()
                    break;
                case "text":
                    this.hinsert_text()
                    break;
            }
            g.visualization()
            stage.batchDraw()

            console.log(g)
            console.log(layer)
        }
    }
}).mount('#handle_main')

const handle_search = Vue.createApp({
    data() {
        return {
            v_info: ''
        }
    },
    methods: {
        check() {
            return (this.v_info == '' || !g.has_vals(this.v_info)) ? g.get_head_ver() : this.v_info
        },
        handle_search_dfs() {
            let s = this.check()
            cartoon_init().dfs(s)
        },
        handle_search_bfs() {
            let s = this.check()
            cartoon_init().bfs(s)
        }
    },
}).mount('#handle_search')

const handle_search_tab = Vue.createApp({
    data() {
        return {
            v_info: '',
            w_info: '',
            has_path_to_info: '',
            picked: 'dfs',
            path_to_fs_info: ''
        }
    },
    methods: {
        check() {
            if (this.w_info == '' || !g.has_vals(this.w_info)) {
                return false
            }
            return (this.v_info == '' || !g.has_vals(this.v_info)) ? g.get_head_ver() : this.v_info
        },
        handle_search_has_path_to() {
            if (!this.check()) return
            let s = this.check()
            this.has_path_to_info = cartoon_init().has_path_to(s, this.w_info, this.picked)
        },
        handle_search_path_to_fs() {
            if (!this.check()) return
            let s = this.check()
            let g_t = cartoon_init()
            let stack_lo = g.path_to_fs(s, this.w_info, this.picked)
            if (stack_lo != null) {
                this.path_to_fs_info = stack_lo.stack_list
                cartoon_path_to(stack_lo.stack_list, tl, g_t)
            }
            else {
                this.path_to_fs_info = 'Unreachable vertex'
            }
        }
    },
}).mount('#handle_search_path')

const handle_connected_components = Vue.createApp({
    data() {
        return {
            v_info: '',
            w_info: '',
            count_info: '',
            order_rule_info: '',
            cc_id_list_info: '',
            connected_info: '',
        }
    },
    methods: {
        check() {
            if (this.w_info == '' || !g.has_vals(this.w_info)) {
                return false
            }
            return (this.v_info == '' || !g.has_vals(this.v_info)) ? g.get_head_ver() : this.v_info
        },
        handle_set_order_rule_info() {
            this.order_rule_info = new Info_String()
            let info = (g.graph_type.is_undirected()) ? "cc : 顶点存储顺序" : "scc_kosaraju : 反向图 GR 的逆后序排列"
            this.order_rule_info.updata(info)
        },
        handle_connected_components() {
            this.count_info = new Info_String()
            this.handle_set_order_rule_info()

            let g_t = cartoon_init()
            Object.assign(g_t, {
                count_info: this.count_info,
                cc_id_list: this.cc_id_list
            })
            this.cc_id_list_info = g_t.connected_components()
        },
        handle_connected() {
            if (!this.check()) return
            let s = this.check()
            this.connected_info = g.connected(s, this.w_info)
        }
    },
}).mount('#handle_connected_components')

const handle_sort = Vue.createApp({
    data() {
        return {
            pre_info: '',
            post_info: '',
            revpost_info: '',
            topological_info: ''
        }
    },
    methods: {
        handle_sort_depth_first_order() {
            this.pre_info = new Queue();
            this.post_info = new Queue();
            this.revpost_info = new Stack()
            
            let g_t = cartoon_init()
            Object.assign(g_t, {
                pre_info: this.pre_info,
                post_info: this.post_info,
                revpost_info: this.revpost_info
            })
            g_t.depth_first_order()
        },
        handle_search_topological() {
            this.revpost_info = new Stack()
            let g_t = cartoon_init()
            Object.assign(g_t, {
                revpost_info: this.revpost_info
            })
            this.topological_info = g_t.topological()
        }
    },
}).mount('#handle_sort')

const handle_mst_prim = Vue.createApp({
    data() {
        return {
            s_info: '',
            pq_info: '',
            mst_info: ''
        }
    },
    methods: {
        check() {
            return (this.s_info == '' || !g.has_vals(this.s_info)) ? g.get_head_ver() : this.s_info
        },
        handle_mst_prim() {
            this.pq_info = new Priority_queue((a, b) => a.weight - b.weight);
            this.mst_info = new Queue();

            let s = this.check()
            let g_t = cartoon_init()
            Object.assign(g_t, {
                pq_info: this.pq_info,
                mst_info: this.mst_info
            })
            g_t.mst_prim(s)
            
            tl.call(cartoon_del_arrow_all, [g_t], "+=1")
            cartoon_default_end(tl, g_t)
        }
    },
}).mount('#handle_mst_prim')

const handle_mst_kruskal = Vue.createApp({
    data() {
        return {
            s_info: '',
            vn_info: '',
            pq_info: '',
            mst_info: ''
        }
    },
    methods: {
        check() {
            return (this.s_info == '' || !g.has_vals(this.s_info)) ? g.get_head_ver() : this.s_info
        },
        handle_mst_kruskal() {
            this.pq_info = new Priority_queue((a, b) => a.weight - b.weight);
            this.mst_info = new Queue()

            let s = this.check()
            let g_t = cartoon_init()
            this.vn_info = g_t.vn()
            Object.assign(g_t, {
                pq_info: this.pq_info,
                mst_info: this.mst_info
            })
            g_t.mst_kruskal(s)

            tl.call(cartoon_del_arrow_all, [g_t], "+=1")
            cartoon_change_color(g_t.get_head_ver(), tl, g_t)
        }
    },
}).mount('#handle_mst_kruskal')

const handle_mst_vyssotsky = Vue.createApp({
    data() {
        return {
            s_info: '',
            pq_info: '',
            mst_info: ''
        }
    },
    methods: {
        check() {
            return (this.s_info == '' || !g.has_vals(this.s_info)) ? g.get_head_ver() : this.s_info
        },
        handle_mst_vyssotsky() {
            this.pq_info = new Priority_queue((a, b) => b.weight - a.weight)
            this.mst_info = new Queue()

            let s = this.check()
            let g_t = cartoon_init()
            Object.assign(g_t, {
                pq_info: this.pq_info,
                mst_info: this.mst_info
            })
            g_t.mst_vyssotsky(s)

        }
    },
}).mount('#handle_mst_vyssotsky')

const handle_spt_djkstra = Vue.createApp({
    data() {
        return {
            v_info: '',
            w_info: '',
            pq_info: '',
            relax_info: '',
            path_to_sp_info: '',
            res_status: false,
            res: '',
        }
    },
    methods: {
        check() {
            return (this.v_info == '' || !g.has_vals(this.v_info)) ? g.get_head_ver() : this.v_info
        },
        handle_spt_djkstra() {
            this.res_status = false
            this.pq_info = new Priority_queue_index((a, b) => a[1] - b[1])
            this.relax_info = new Info_String()

            let s = this.check()
            let g_t = cartoon_init()
            Object.assign(g_t, {
                pq_info: this.pq_info,
                relax_info: this.relax_info
            })
            
            cartoon_create_label_s_to_list(s, g_t)
            this.res = g_t.spt_dijkstra(s)
            
            cartoon_call((info) => {this.res_status = true}, [''], tl, g_t)
        },
        handle_spt_path_to_sp() {
            let s = this.check()
            let g_t = cartoon_init()

            let stack_lo = g.path_to_sp(s, this.w_info)
            if (stack_lo != null) {
                this.path_to_sp_info = stack_lo.stack_list
                cartoon_path_to(stack_lo.stack_list, tl, g_t)
            }
            else {
                this.path_to_sp_info = 'Unreachable vertex'
            }
        }
    },
}).mount('#handle_spt_djkstra')

const handle_spt_bellman_ford = Vue.createApp({
    data() {
        return {
            v_info: '',
            w_info: '',
            q_re_info: '',
            relax_info: '',
            path_to_sp_info: '',
            has_negative_cycle_info: '',
            res_status: false,
            res: '',
        }
    },
    methods: {
        check() {
            return (this.v_info == '' || !g.has_vals(this.v_info)) ? g.get_head_ver() : this.v_info
        },
        handle_spt_bellman_ford() {
            this.q_re_info = new Queue()
            this.relax_info = new Info_String()

            let s = this.check()
            let g_t = cartoon_init()
            Object.assign(g_t, {
                q_re_info: this.q_re_info,
                relax_info: this.relax_info,
            })

            this.has_negative_cycle_info = g.has_negative_cycle(s)

            cartoon_create_label_s_to_list(s, g_t)
            this.res = g_t.spt_bellman_ford()

            cartoon_call((info) => {this.res_status = true}, [''], tl, g_t)
        },
        handle_spt_path_to_sp_bmf() {
            let s = this.check()
            let g_t = cartoon_init()

            let stack_lo = g.path_to_sp_bmf(s, this.w_info)
            if (stack_lo != null) {
                this.path_to_sp_info = stack_lo.stack_list
                cartoon_path_to(stack_lo.stack_list, tl, g_t)
            }
            else {
                this.path_to_sp_info = 'Unreachable vertex'
            }
        }
    },
}).mount('#handle_spt_bellman_ford')

const handle_spt_DAG_weighted = Vue.createApp({
    data() {
        return {
            v_info: '',
            w_info: '',
            pq_info: '',
            relax_info: '',
            path_to_sp_info: '',
            dag_weighted_info: '',
            topological_info: '',
            res_status: false,
            res: '',
        }
    },
    methods: {
        check() {
            return (this.v_info == '' || !g.has_vals(this.v_info)) ? g.get_head_ver() : this.v_info
        },
        handle_topological_info() {
            this.topological_info = g.topological()
        },
        handle_spt_DAG_weighted() {
            if (g.is_dag() && g.graph_type.is_weighted()) {
                this.dag_weighted_info = true

                this.handle_topological_info()

                this.res_status = false
                this.pq_info = new Priority_queue_index((a, b) => a[1] - b[1])
                this.relax_info = new Info_String()

                let s = this.check()
                let g_t = cartoon_init()
                Object.assign(g_t, {
                    pq_info: this.pq_info,
                    relax_info: this.relax_info
                })
                
                cartoon_create_label_s_to_list(s, g_t)
                this.res = g_t.spt_dag_a(s)
                
                cartoon_call((info) => {this.res_status = true}, [''], tl, g_t)
            }
            else {
                this.dag_weighted_info = false
            }
        },
        handle_spt_path_to_sp() {
            let s = this.check()
            let g_t = cartoon_init()

            this.handle_topological_info()

            let stack_lo = g.path_to_sp(s, this.w_info)
            if (stack_lo != null) {
                this.path_to_sp_info = stack_lo.stack_list
                cartoon_path_to(stack_lo.stack_list, tl, g_t)
            }
            else {
                this.path_to_sp_info = 'Unreachable vertex'
            }
        }
    },
}).mount('#handle_spt_DAG_weighted')