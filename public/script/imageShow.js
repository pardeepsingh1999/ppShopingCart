function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        
        reader.onload = function(e) {
            $('#imgPreview').attr('src', e.target.result).width(150).height(150);
        }
        
        reader.readAsDataURL(input.files[0]); // convert to base64 string
    }
}

$(document).ready( () => {
    $("#img").on('change', function() {
        readURL(this);
    });
})
