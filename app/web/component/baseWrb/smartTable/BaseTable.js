import React from 'react';
import { Component } from 'react';
import numeral from 'numeral'
import _ from 'lodash'

import { Table, LocaleProvider,message } from 'antd'
import _Tools from './tools'
import {Http} from '../http'
import moment from 'moment';
import 'moment/locale/zh-cn';
import zh_CN from 'antd/es/locale-provider/zh_CN';
import { loginShow, isLogin } from '../../../utils/userHelper'
import { NoTokenPost,Post,Get } from '../../../utils/request';
moment.locale('zh-cn');
import './table.css'

export default class    BaseTable extends Component {
    constructor(props) {
        super(props);
        let queryConditions = _Tools.decodeBase64(_.get(props, 'location.query.conditions'));
        this.state = {
            dataList: null,
            page: _.extend({
                number: _.get(props, 'location.query.number')||1,
                size: _.get(props, 'location.query.size')||10
            }, props.defaultPage),
            sort: props.defaultSort||(_.get(props, 'location.query.sort')?_Tools.decodeBase64(_.get(props, 'location.query.sort')):{}),
            conditions: _.isEmpty(queryConditions)?props.defaultConditions:queryConditions,
            loading: false
        }
    }

    componentDidMount() {
        //控制是否第一次加载数据
        if(!this.props.noQueryOnce){
            this.query();
        }
    }

    componentWillReceiveProps(nextProps){
        if(JSON.stringify(_.get(this.props,"queryParams"))!==JSON.stringify(_.get(nextProps,"queryParams"))){
            this.setState({
                page: _.extend(this.state.page, {number: 1})
            })
        }
    }

    getPage=()=>{
        return this.state.page
    }

    query = ()=> {
        var that=this
        const { queryFunc, genConditionsFunc,sourceData, queryParams,queryURL,queryType,setPage,hideMessage=false,type } = this.props;
        // if(!queryFunc || !genConditionsFunc) return;
        this.setState({loading: true}, async()=> {
            const { page, sort, conditions } = this.state;
            var pageData=page

            if(sourceData){
                var page1={
                    number:pageData.number,
                    size: _.get(this.props,"sourceData.size"),
                    totalElements: _.get(this.props,"sourceData.totalCount"),
                    totalPages: _.get(this.props,"sourceData.totalPage"),
                }
                that.setState({
                    loading: false,
                    dataList: _.get(this.props,"sourceData.content"),
                    page: page1
                });
            }else{
                if(queryType=='post'){
                    const res = await Post(queryURL,
                        _.extend(queryParams||{}, {
                            page: page.number,
                            size: page.size
                        }) 
                    )
                    if(_.get(res,"data.message")!='操作成功'&&!hideMessage){
                        message.info(_.get(res,"data.message"),'unique');
                    }
                    if(setPage){
                        setPage({
                            number:pageData.number,
                            size:_.get(res, 'data.content.size')||_.get(res, 'data.content.pageSize'),
                            totalElements:_.get(res, 'data.content.totalCount')||_.get(res, 'data.content.total'),
                            totalPages:_.get(res, 'data.content.totalPage')
                        })
                    }
                    that.setState({
                        loading: false,
                        dataList: _.get(res, 'data.content.content'),
                        page: {
                            number:pageData.number,
                            size:_.get(res, 'data.content.size')||_.get(res, 'data.content.pageSize'),
                            totalElements:_.get(res, 'data.content.totalCount')||_.get(res, 'data.content.total'),
                            totalPages:_.get(res, 'data.content.totalPage')
                        }
                    });
                    // Http.post(queryURL,
                    //     _.extend(queryParams||{}, {
                    //         page: page.number,
                    //         size: page.size
                    //     })
                    // ).then((res)=>{
                    //     if(_.get(res,"data.message")!='操作成功'&&!hideMessage){
                    //         message.info(_.get(res,"data.message"));
                    //     }
                    //     var page={
                    //         number:pageData.number,
                    //         size:_.get(res, 'data.content.size')||_.get(res, 'data.content.pageSize'),
                    //         totalElements:_.get(res, 'data.content.totalCount')||_.get(res, 'data.content.total'),
                    //         totalPages:_.get(res, 'data.content.totalPage')
                    //     }
                    //     if(setPage){
                    //         setPage(page)
                    //     }
                    //     that.setState({
                    //         loading: false,
                    //         dataList: _.get(res, 'data.content.content'),
                    //         page: page,
                    //     });
                    // })
                }
                else{
                    let temnpQueryURL = queryURL + '&page='+ page.number + '&size=' + page.size
                    const res = await Get(temnpQueryURL)
                    if(_.get(res,"data.message")!='操作成功'&&!hideMessage){
                        message.info(_.get(res,"data.message"));
                    }
                    that.setState({
                        loading: false,
                        dataList: _.get(res, 'data.content.content'),
                        page: {
                            number:pageData.number,
                            size:_.get(res, 'data.content.size'),
                            totalElements:_.get(res, 'data.content.totalCount'),
                            totalPages:_.get(res, 'data.content.totalPage')
                        }
                    });
                    // Http.get(queryURL,
                    //     _.extend(queryParams||{}, {
                    //         page: page.number,
                    //         size: page.size,
                    //     })
                    // ).then((res)=>{
                    //     if(_.get(res,"data.message")!='操作成功'&&!hideMessage){
                    //         message.info(_.get(res,"data.message"));
                    //     }
                    //     var page={
                    //         number:pageData.number,
                    //         size:_.get(res, 'data.content.size'),
                    //         totalElements:_.get(res, 'data.content.totalCount'),
                    //         totalPages:_.get(res, 'data.content.totalPage')
                    //     }
                    //     that.setState({
                    //         loading: false,
                    //         dataList: _.get(res, 'data.content.content'),
                    //         page: page,
                    //     });
                    // })
                }
            }


            //     if(queryType=='post'){
            //         Http.post(queryURL,
            //             _.extend(queryParams||{}, {
            //                 page: page.number,
            //                 pageSize: page.size,
            //             })
            //         ).then((res)=>{
            //             var page={
            //                 number:pageData.number,
            //                 size:_.get(res, 'data.content.pageSize'),
            //                 totalElements:_.get(res, 'data.content.totalCount'),
            //                 totalPages:_.get(res, 'data.content.totalPage')
            //             }
            //             that.setState({
            //                 loading: false,
            //                 dataList: _.get(res, 'data.content.content'),
            //                 page: page,
            //             });
            //         })
            // }else{
            //         Http.get(queryURL,
            //             _.extend(queryParams||{}, {
            //                 page: page.number,
            //                 pageSize: page.size,
            //             })
            //         ).then((res)=>{
            //             var page={
            //                 number:pageData.number,
            //                 size:_.get(res, 'data.content.pageSize'),
            //                 totalElements:_.get(res, 'data.content.totalCount'),
            //                 totalPages:_.get(res, 'data.content.totalPage')
            //             }
            //             that.setState({
            //                 loading: false,
            //                 dataList: _.get(res, 'data.content.content'),
            //                 page: page,
            //             });
            //         })
            // }


        });
    };

    changeConditions = (conditions)=> {
        this.setState({
            conditions: conditions,
            page: _.extend(this.state.page, {number: 0})
        }, ()=> {
            this.query();
        })
    };

    changePage = (page, size)=> {
        if(this.props.type === 'is'||this.props.type === 'qa'||this.props.type ==='needLogin'){
            if(!isLogin()){
                loginShow()
            }else{
                this.setState({page: _.extend(this.state.page, {number: page, size: size})}, ()=> {
                    this.query();
                })
            }
        }else{
            this.setState({page: _.extend(this.state.page, {number: page, size: size})}, ()=> {
                this.query();
            })
        }
        if(this.props.onPageChange&& _.isFunction(this.props.onPageChange)){
            this.props.onPageChange(
                page,
                size
            )
        }
    };

    changeSort = (sort)=> {
        this.setState({
            sort: sort,
            page: _.extend(this.state.page, {number: 0})
        }, ()=> {
            this.query();
        })
    };

    render = ()=> {
        const { ...other } = this.props;
        const { loading, dataList, page, sort } = this.state;
        return (
            <LocaleProvider locale={zh_CN}>
                <DataTable
                    dataList={dataList}
                    loading={loading}
                    sortWithOutServices={this.props.sortWithOutServices}
                    page={page}
                    sort={sort}
                    pageSizeOptionsCustom={this.props.pageSizeOptionsCustom}
                    onChangePage={this.changePage}
                    onChangeSort={this.changeSort}
                    {...other}
                />
            </LocaleProvider>
        )
    }
}

class DataTable extends Component {
    constructor(props) {
        super(props);
    }

    onChangePage = (page, pageSize)=> {
        if(_.isFunction(this.props.onChangePage)) this.props.onChangePage(page, pageSize);
    };

    onChangeSize = (current, size)=> {
        if(_.isFunction(this.props.onChangePage)) this.props.onChangePage(1, size);
    };

    onChangeTable = (pagination, filters, sorter)=> {
	     if(!this.props.sortWithOutServices) {
		     let order = _.get(sorter, 'order');
		     if(order==='ascend') {
			     order='asc';
		     } else if(order==='descend') {
			     order='desc';
		     }
		     if(!order) return;
		     let sortString = _.get(sorter, 'columnKey')+','+order;
		     // 如果排序字符串没有变化则不进行排序
		     if(sortString===this.props.sort) return;
		     if(_.isFunction(this.props.onChangeSort)) this.props.onChangeSort(_.get(sorter, 'columnKey')+','+order);
	     }
    };

    render() {
        let { rowKey, dataList, page, columns, loading, showHeader, hidePagination, size, sortColumns, ...other } = this.props;

        page = page ||{};
        columns = columns||[];
        sortColumns = sortColumns||[];
        if(columns[0]&&columns[0]['isIndex']==true){
            let first=columns.shift()
            columns.unshift(
                {
                    ...first,
                    render: (t, r, i)=>{
                        let page = this.props.page.number||1
                        let size = this.props.page.size||10
                        return (
                            <div style={{ userSelect: "none", cursor: "pointer", fontSize: 16, width: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                {(page-1)*size+i+1}
                            </div>
                        )
                    }
                }
            )
        }
        columns.map((columnData)=> {
            if(_.indexOf(sortColumns, columnData.dataIndex)>=0) columnData.sorter = true;
        });

        return (
            <div>
                <Table rowKey={rowKey||'id'}
                       dataSource={dataList}
                       pagination={hidePagination?false:{
                           showQuickJumper: true,
                           showSizeChanger: true,
                           showTotal: (total)=>{ return '共 '+numeral(total).format('0,0')+' 行数据'},
                           size: 'large',
                           current: page.number,
                           pageSize: page.size,
                           total: page.totalElements,
                           onChange: this.onChangePage,
                           onShowSizeChange: this.onChangeSize,
                           pageSizeOptions: this.props.pageSizeOptionsCustom ? this.props.pageSizeOptionsCustom :['10']
                       }}
                       onChange={this.onChangeTable}
                       bordered size={size||'small'}
                       loading={loading}
                       columns={columns}
                       showHeader={showHeader}
                       {...other}
                />
            </div>
        )
    }
};
