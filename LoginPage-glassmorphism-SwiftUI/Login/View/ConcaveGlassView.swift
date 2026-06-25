//
//  ConcaveGlassView.swift
//  Login
//
//  Created by Shreyash Gajbhiye on 17/08/23.
//

import SwiftUI

struct ConcaveGlassView: ViewModifier {
  func body(content: Content) -> some View {
    if #available(iOS 15.0, *) {
      content
        .padding()
        .frame(height: 50)
        .background(.ultraThinMaterial)
        .overlay(
          RoundedRectangle(cornerRadius: 14)
            .stroke(.linearGradient(colors:[.black,.white.opacity(0.75)], startPoint: .top, endPoint: .bottom), lineWidth: 2)
            .blur(radius: 2)
        )
        .overlay(
          RoundedRectangle(cornerRadius: 14)
            .stroke(.radialGradient(Gradient(colors: [.clear,.black.opacity(0.1)]), center: .bottomLeading, startRadius: 300, endRadius: 0), lineWidth: 15)
            .offset(y: 5)
        )
        .cornerRadius(14)
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
