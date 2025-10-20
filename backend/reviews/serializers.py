"""
Review Serializers
"""
from rest_framework import serializers
from .models import Review, ReviewImage
from accounts.models import User


class ReviewerSerializer(serializers.ModelSerializer):
    """Reviewer info"""
    
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'full_name', 'avatar']


class ReviewImageSerializer(serializers.ModelSerializer):
    """Review Image Serializer"""
    
    class Meta:
        model = ReviewImage
        fields = ['id', 'image', 'caption']


class ReviewListSerializer(serializers.ModelSerializer):
    """Review List Serializer"""
    
    customer = ReviewerSerializer(read_only=True)
    images = ReviewImageSerializer(many=True, read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'customer', 'rating', 'service_quality',
            'cleanliness', 'staff_behavior', 'value_for_money',
            'title', 'comment', 'is_verified', 'response',
            'responded_at', 'helpful_count', 'images', 'created_at'
        ]


class ReviewCreateSerializer(serializers.ModelSerializer):
    """Review Create Serializer"""
    
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        allow_empty=True,
        write_only=True
    )
    
    class Meta:
        model = Review
        fields = [
            'rating', 'service_quality', 'cleanliness',
            'staff_behavior', 'value_for_money', 'title',
            'comment', 'images'
        ]
    
    def validate_rating(self, value):
        """Validate rating"""
        if value < 1 or value > 5:
            raise serializers.ValidationError("Rating must be between 1 and 5.")
        return value
    
    def create(self, validated_data):
        """Create review with images"""
        images_data = validated_data.pop('images', [])
        booking = self.context.get('booking')
        
        review = Review.objects.create(
            customer=self.context['request'].user,
            business=booking.business,
            booking=booking,
            **validated_data
        )
        
        # Create review images
        for image_data in images_data:
            ReviewImage.objects.create(
                review=review,
                image=image_data
            )
        
        return review
