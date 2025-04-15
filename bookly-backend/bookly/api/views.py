from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class TestApiView(APIView):
    def get(self, request):
        data = {
            'message': 'Django API is working!'
        }
        return Response(data, status=status.HTTP_200_OK)
