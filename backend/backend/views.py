from django.http import JsonResponse

def get_text(request):
    text = "All operational from the Django backend! whiel running change"

    data = {
        'text': text,
    }

    return JsonResponse(data)
