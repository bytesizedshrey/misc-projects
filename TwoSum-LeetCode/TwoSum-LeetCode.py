class Solution(object):
    def twoSum(self, nums, target):
        """
        :type nums: List[int]
        :type target: int
        :rtype: List[int]
        """
        num_to_index = {}  # Create a dictionary to store the numbers and their indices.

        for i, num in enumerate(nums):
            # Calculate the complement of the current number needed to reach the target.
            complement = target - num

            # Check if the complement exists in the dictionary.
            if complement in num_to_index:
                # If found, return the indices of the two numbers.
                return [num_to_index[complement], i]

            # If the complement is not in the dictionary, add the current number to it.
            num_to_index[num] = i

        # If no solution is found, you can return an empty list or raise an exception.
        return []
