export const apiMap = {
    // UserAuth
    RefToken: {method: 'GET', path: '/UserAuth/refresh_token'},
    UserLogin: {method: 'POST', path: '/UserAuth/login'},
    UserLogout: {method: 'POST', path: '/UserAuth/logout'},
    UserQuery: {method: 'POST', path: '/UserAuth/select_user'},
    UserAdd: {method: 'POST', path: '/UserAuth/create_user'},
    UserUpdate: {method: 'POST', path: '/UserAuth/update_user'},
    UserDelete: {method: 'POST', path: '/UserAuth/delete_user'},
    // ProdManage
    ProdQuery: {method: 'POST', path: '/ProdManage/select_prod'},
    ProdAdd: {method: 'POST', path: '/ProdManage/create_prod'},
    ProdUpdate: {method: 'POST', path: '/ProdManage/update_prod'},
    ProdDelete: {method: 'POST', path: '/ProdManage/delete_prod'},

    TagQuery: {method: 'GET', path: '/ProdManage/select_tag'},
    TagAdd: {method: 'POST', path: '/ProdManage/create_tag'},
    TagUpdate: {method: 'POST', path: '/ProdManage/update_tag'},
    TagDelete: {method: 'POST', path: '/ProdManage/delete_tag'},

    ProdAddTag: {method: 'POST', path: '/ProdManage/prod_add_tag'},
    ProdDelTag: {method: 'POST', path: '/ProdManage/prod_del_tag'},

    StockQuery: {method: 'GET', path: '/ProdManage/select_stock'},
    StockIn: {method: 'POST', path: '/ProdManage/stock_in'},
    StockOut: {method: 'POST', path: '/ProdManage/stock_out'},
    StockCancel: {method: 'POST', path: '/ProdManage/stock_cancel'},
    StockLogQuery: {method: 'GET', path: '/ProdManage/select_stock_log'},

    UploadFile:{method: 'POST', path: '/FileHandle/upload_file'},
    ParseFile:{method: 'POST', path: '/FileHandle/parse_file'},
    DownloadFile:{method: 'GET', path: '/FileHandle/download/{filename}'},
};