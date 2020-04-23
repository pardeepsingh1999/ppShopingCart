$(document).ready( () => {
    if($('textarea#ta').length) {
        CKEDITOR.replace('ta');
    }

    $('a.confirmDeletion').on('click', () => {
        if(!confirm('Confirm deletion')) {
            return false;
        }
    })

    if($("[data-fancybox]").length) {
        $("[data-fancybox]").fancybox();
    }

    // $(".activeList").click(function(){
    //     let index = $(this).index()
        
    //     $(".activeList").removeClass('active');
    //     $(".activeList a").removeClass('text-white');

    //     $(".activeList").eq(index).addClass('active');
    //     $(".activeList a").eq(index).addClass('text-white');

    //   });
});


setTimeout(function(){
    $("div.alert").slideUp();
}, 3000 ); // 3 secs

function hoverActiveDelete(selector){
    $(`#${selector}`).addClass('table-danger')
}

function hoverRemoveDelete(selector){
    $(`#${selector}`).removeClass('table-danger')
}

function hoverActiveEdit(selector){
    $(`#${selector}`).addClass('table-warning')
}

function hoverRemoveEdit(selector){
    $(`#${selector}`).removeClass('table-warning')
}

function activeList(selector){
    $(`#${selector}`).addClass('active')
    $(`#${selector} a`).addClass('text-white')

}

function deactiveList(selector){
    $(`#${selector}`).removeClass('active')
    $(`#${selector} a`).removeClass('text-white')

}

function addItem(selector){
    $(`#${selector}`).addClass('table-success')
}

function addItemOut(selector){
    $(`#${selector}`).removeClass('table-success')
}