cmake_minimum_required(VERSION 3.10)
project(PoliticalRPG)

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Add executable
add_executable(PoliticalRPG src/main.cpp)

# Set output directory
set_target_properties(PoliticalRPG PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY ${CMAKE_BINARY_DIR}/bin
)

# For Windows, ensure console application
if(WIN32)
    set_target_properties(PoliticalRPG PROPERTIES
        WIN32_EXECUTABLE FALSE
    )
endif()
