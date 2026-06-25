//
//  ConvexGlassViewWithOverlay.swift
//  Login
//
//  Created by Shreyash Gajbhiye on 17/08/23.
//

import SwiftUI

struct ConcaveGlassViewWithOverlay: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOS 15.0, *) {
            content
                .padding()
                .frame(height: 50)
                .background(.ultraThinMaterial)
                .overlay(
                    LinearGradient(colors: [.black.opacity(0.2), .clear], startPoint: .top, endPoint: .bottom))
                .cornerRadius(14)
                .shadow(color: .white.opacity(0.9), radius: 2, x: -1, y: -2)
                .shadow(color: .black.opacity(0.6), radius: 2, x: 2, y: 2)
        } else {
            // Fallback on earlier versions
            content
                .padding()
                .frame(height: 50)
                .cornerRadius(14)
                .shadow(color: .white, radius: 3, x: -3, y: -3)
                .shadow(color: .black, radius: 3, x: 3, y: 3)
        }
    }
}

//struct ConvexGlassViewWithOverlay_Previews: PreviewProvider {
//    static var previews: some View {
//      ConcaveGlassViewWithOverlay()
//    }
//}
